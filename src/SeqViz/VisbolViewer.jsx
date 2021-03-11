import React from "react";
import withSelectionHandler from './handlers/selection.jsx';

import { prepareDisplay } from 'visbol';
import Rendering from 'visbol-react';

class VisbolViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: null
    }
  }

  componentDidMount = () => {
    this.setList();
  }

  componentDidUpdate = ({ displayList }) => {
    if (displayList.name !== this.props.displayList.name) {
      this.setList();
    }
  }

  setList = () => {
    const { displayList } = this.props;
    this.setState({
      display: prepareDisplay(displayList)
    })
  }

  updateReferences(display, inputRef) {
    if (display) {
      display.renderGlyphs();
    display.toPlace.forEach(item => {
      if (item.isGlyph) {
        inputRef(item.id, {
          ref: item.id,
          annref: item.id,
          type: "ANNOTATION",
          ranges: item.ranges
        });
      }
    });
    }
  }

  render() {
    const { display } = this.state;
    this.updateReferences(display, this.props.inputRef);
    var id = undefined;
    if (this.props.selection && this.props.selection[0])
      id = this.props.selection[0].annref;
    if (display && this.props.Visbol) {
      return <Rendering display={display} selection={this.props.selection ? this.props.selection[0].annref : undefined} mouseEvent={this.props.mouseEvent} hideNavigation={true} size={1.75} customTooltip={true} />
    }
    else {
      return (<div></div>);
    }
  }
}

export default withSelectionHandler(VisbolViewer);