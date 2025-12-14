import { createSink } from "~/src/sink"

import { defaultPlugins, PluginTypes } from "./plugins"

const { withSink, SinkEditable } = createSink<PluginTypes>(defaultPlugins)

export { SinkEditable, withSink }
