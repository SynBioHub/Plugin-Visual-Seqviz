import * as React from "react";

import prepareDisplay from './Visbol/design/prepareDisplay';
const SBOLDocument = require('sboljs');
import { getDisplayList } from './Visbol/gatherInfo/originalVisbol/getDisplayList';
import getInteractionList from './Visbol/gatherInfo/originalVisbol/getInteractionList';
import Rendering from './Visbol/rendering/reactRender';

export default class VisbolViewer extends React.Component {
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

  render() {
    const { display } = this.state;
    const { selection } = this.props;
    if (display) {
      return <Rendering display={display} selection={selection} />
    }
    else {
      return (<div></div>);
    }
  }
}