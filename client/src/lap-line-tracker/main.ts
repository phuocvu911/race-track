import { mount } from 'svelte'
import { connect } from '../lib/socket.svelte.js'
import LapLineTracker from './LapLineTracker.svelte'
import '../app.css'

const target = document.getElementById('app')
if (!target) throw new Error('#app element not found in index.html')

connect('lap-line-tracker')
mount(LapLineTracker, { target })
