import type { User } from 'firebase/auth'
import { getFirebase } from '../firebase'
import type { AnsweredQuestion, Grade } from '../types'

export interface PlayerEntry {
  uid: string
  name: string
  photoURL: string | null
  totalPoints: number
  testsCount: number
  bestPercentage: number
}

/** Data minimization: "Γιάννης Παπαδόπουλος" -> "Γιάννης Π." for public display. */
export function shortName(displayName: string | null): string {
  if (!displayName?.trim()) return 'Ανώνυμος'
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

/** Saves a finished test and updates the player's leaderboard aggregate. */
export async function saveResultToCloud(user: User, answers: AnsweredQuestion[], grade?: Grade) {
  const fb = await getFirebase()
  if (!fb || answers.length === 0) return
  const { collection, doc, getDoc, increment, serverTimestamp, setDoc } = await import(
    'firebase/firestore'
  )
  const correct = answers.filter((a) => a.isCorrect).length
  const percentage = Math.round((correct / answers.length) * 100)

  const publicName = shortName(user.displayName)

  const resultRef = doc(collection(fb.db, 'results'))
  await setDoc(resultRef, {
    uid: user.uid,
    name: publicName,
    total: answers.length,
    correct,
    percentage,
    grade: grade ?? null,
    createdAt: serverTimestamp(),
  })

  const playerRef = doc(fb.db, 'players', user.uid)
  const existing = await getDoc(playerRef)
  const prevBest = existing.exists() ? (existing.data().bestPercentage ?? 0) : 0
  await setDoc(
    playerRef,
    {
      name: publicName,
      photoURL: user.photoURL ?? null,
      totalPoints: increment(correct),
      testsCount: increment(1),
      bestPercentage: Math.max(prevBest, percentage),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function fetchLeaderboard(topN = 20): Promise<PlayerEntry[]> {
  const fb = await getFirebase()
  if (!fb) return []
  const { collection, getDocs, limit, orderBy, query } = await import('firebase/firestore')
  const q = query(collection(fb.db, 'players'), orderBy('totalPoints', 'desc'), limit(topN))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      uid: d.id,
      name: data.name ?? 'Ανώνυμος',
      photoURL: data.photoURL ?? null,
      totalPoints: data.totalPoints ?? 0,
      testsCount: data.testsCount ?? 0,
      bestPercentage: data.bestPercentage ?? 0,
    }
  })
}

/** Records a 1-5 rating and/or a "something's wrong" report for a question. */
export async function submitQuestionFeedback(
  user: User,
  questionId: string,
  questionText: string,
  rating: number | null,
  report: boolean,
) {
  const fb = await getFirebase()
  if (!fb) return
  const { doc, increment, serverTimestamp, setDoc } = await import('firebase/firestore')
  const feedbackRef = doc(fb.db, 'feedback', questionId)
  const payload: Record<string, unknown> = {
    question: questionText,
    updatedAt: serverTimestamp(),
  }
  if (rating !== null) {
    payload.ratingSum = increment(rating)
    payload.ratingCount = increment(1)
  }
  if (report) {
    payload.reportCount = increment(1)
    payload[`reporters.${user.uid}`] = true
  }
  await setDoc(feedbackRef, payload, { merge: true })
}
