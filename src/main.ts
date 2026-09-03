import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// last line of defense: an uncaught error in any component must never leave
// the app silently frozen — log it so it's diagnosable instead
app.config.errorHandler = (err, _instance, info) => {
  console.error('Unhandled app error', err, info)
}

app.mount('#app')
