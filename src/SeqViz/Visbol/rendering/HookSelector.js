const HookSelector = {
    'genetic-production': require('./hooks/process'),
    'inhibition': require('./hooks/inhibition'),
    'stimulation': require('./hooks/stimulation'),
    'degradation': require('./hooks/degradation'),
    'control': require('./hooks/control')
}

export default HookSelector;