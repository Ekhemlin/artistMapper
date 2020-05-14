// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/*
  Zoom slider and zoom to fit controls for GraphView
*/

import React from 'react';
import Parse from 'html-react-parser';
import faExpand from '@fortawesome/fontawesome-free/svgs/solid/expand.svg';


function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path d="M212.686 315.314L120 408l32.922 31.029c15.12 15.12 4.412 40.971-16.97 40.971h-112C10.697 480 0 469.255 0 456V344c0-21.382 25.803-32.09 40.922-16.971L72 360l92.686-92.686c6.248-6.248 16.379-6.248 22.627 0l25.373 25.373c6.249 6.248 6.249 16.378 0 22.627zm22.628-118.628L328 104l-32.922-31.029C279.958 57.851 290.666 32 312.048 32h112C437.303 32 448 42.745 448 56v112c0 21.382-25.803 32.09-40.922 16.971L376 152l-92.686 92.686c-6.248 6.248-16.379 6.248-22.627 0l-25.373-25.373c-6.249-6.248-6.249-16.378 0-22.627z"></path>
    </svg>
  );
}

const steps = 100; // Slider steps
// const parsedIcon = Parse("/expand.svg"); //  parse SVG once
// const parsedIcon = () => parsedIcon; // convert SVG to react component

type IGraphControlProps = {
  maxZoom?: number,
  minZoom?: number,
  zoomLevel: number,
  zoomToFit: (event: SyntheticMouseEvent<HTMLButtonElement>) => void,
  modifyZoom: (delta: number) => boolean,
};

class GraphControls extends React.Component<IGraphControlProps> {
  static defaultProps = {
    maxZoom: 1.5,
    minZoom: 0.15,
  };

  // Convert slider val (0-steps) to original zoom value range
  sliderToZoom(val: number) {
    const { minZoom, maxZoom } = this.props;

    return (val * ((maxZoom || 0) - (minZoom || 0))) / steps + (minZoom || 0);
  }

  // Convert zoom val (minZoom-maxZoom) to slider range
  zoomToSlider(val: number) {
    const { minZoom, maxZoom } = this.props;

    return ((val - (minZoom || 0)) * steps) / ((maxZoom || 0) - (minZoom || 0));
  }

  // Modify current zoom of graph-view
  zoom = (e: any) => {
    const { minZoom, maxZoom } = this.props;
    const sliderVal = e.target.value;
    const zoomLevelNext = this.sliderToZoom(sliderVal);
    const delta = zoomLevelNext - this.props.zoomLevel;

    if (zoomLevelNext <= (maxZoom || 0) && zoomLevelNext >= (minZoom || 0)) {
      this.props.modifyZoom(delta);
    }
  };

  render() {
    return (
      <div className="graph-controls">
        <div className="slider-wrapper">
          <span>-</span>
          <input
            type="range"
            className="slider"
            min={this.zoomToSlider(this.props.minZoom || 0)}
            max={this.zoomToSlider(this.props.maxZoom || 0)}
            value={this.zoomToSlider(this.props.zoomLevel)}
            onChange={this.zoom}
            step="1"
          />
          <span>+</span>
        </div>
        <button
          type="button"
          className="slider-button"
          onMouseDown={this.props.zoomToFit}>
          <ExpandIcon />
        </button>
      </div>
    );
  }
}

export default GraphControls;
