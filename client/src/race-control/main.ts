import { mount } from 'svelte'
import { connect } from '../lib/socket.svelte.js'
import RaceControl from './RaceControl.svelte'
import '../app.css'

const target = document.getElementById('app')
if (!target) throw new Error('#app element not found in index.html')

connect('race-control')
mount(RaceControl, { target })
