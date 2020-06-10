import React from "react";
import { hydrate } from "react-dom";
import { SeqViz } from "./viewer";

// change non iterable obejct to iterable object, then can use spread operator
function* iterate_object(o) {
  var keys = Object.keys(o);
  for (var i = 0; i < keys.length; i++) {
    yield [keys[i], o[keys[i]]];
  }
}
var data = {}
for (var [key, val] of iterate_object(window.__INITIAL_DATA__)) {
  data[key] = val;
}

hydrate(<SeqViz {...data} />, document.getElementById("reactele"));
