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
  Example usage of GraphView component
*/

import * as React from 'react';

import GraphView from '../components/graph-view.js'

import {
  type IEdgeType as IEdge,
  type INodeType as INode,
  type LayoutEngineType,
} from '../';
import GraphConfig, {
  edgeTypes,
  EMPTY_EDGE_TYPE,
  EMPTY_TYPE,
  NODE_KEY,
  nodeTypes,
  COMPLEX_CIRCLE_TYPE,
  POLY_TYPE,
  SPECIAL_CHILD_SUBTYPE,
  SPECIAL_EDGE_TYPE,
  SPECIAL_TYPE,
  SKINNY_TYPE,
} from './graph-config'; // Configures node/edge types

type IGraph = {
  nodes: INode[],
  edges: IEdge[],
};

// NOTE: Edges must have 'source' & 'target' attributes
// In a more realistic use case, the graph would probably originate
// elsewhere in the App or be generated from some other state upstream of this component.

var sample: IGraph = {
  edges: [
    // {
    //   handleText: '5',
    //   handleTooltipText: '5',
    //   source: 'start1',
    //   target: 'a1',
    //   type: SPECIAL_EDGE_TYPE,
    // },
    // {
    //   handleText: '54',
    //   source: 'a2',
    //   target: 'a4',
    //   type: EMPTY_EDGE_TYPE,
    // }
  ],
  nodes: [
    // {
    //   id: 'start1',
    //   title: 'Start (0)',
    //   type: SPECIAL_TYPE,
    // },
    // {
    //   id: 'a1',
    //   title: 'Node A (1)',
    //   type: SPECIAL_TYPE,
    //   x: 258.3976135253906,
    //   y: 331.9783248901367,
    // },
    // {
    //   id: 'a2',
    //   subtype: SPECIAL_CHILD_SUBTYPE,
    //   title: 'Node B (2)',
    //   type: EMPTY_TYPE,
    //   x: 593.9393920898438,
    //   y: 260.6060791015625,
    // },
    // {
    //   id: 'a4',
    //   title: 'Node D (4)',
    //   type: EMPTY_TYPE,
    //   x: 600.5757598876953,
    //   y: 600.81818389892578,
    // }
  ],
};


const fetchData = async (artist1, artist2, token) => {
  const result = await fetch('/fetchArtistMap', {
    method: 'post',
    body: JSON.stringify({"artist1": artist1, "artist2" : artist2, "token" : token, "numRelated" : 5}),
    headers: {
      'Content-Type' : 'application/json'
    }
  });
  const body = await result.json();
  return body;
};

const expandData = async (artist1, artist2, token) => {
  const result = await fetch('/expandArtistMap', {
    method: 'post',
    body: JSON.stringify({"artist1ID": artist1, "artist2ID" : artist2, "token" : token, "numRelated" : 5}),
    headers: {
      'Content-Type' : 'application/json'
    }
  });
  const body = await result.json();
  return body;
};



function generateSample(totalNodes) {
  const generatedSample: IGraph = {
    edges: [],
    nodes: [],
  };
  let y = 0;
  let x = 0;

  const numNodes = totalNodes ? totalNodes : 0;

  // generate large array of nodes
  // These loops are fast enough. 1000 nodes = .45ms + .34ms
  // 2000 nodes = .86ms + .68ms
  // implying a linear relationship with number of nodes.
  for (let i = 1; i <= numNodes; i++) {
    if (i % 20 === 0) {
      y++;
      x = 0;
    } else {
      x++;
    }

    generatedSample.nodes.push({
      id: `a${i}`,
      title: `Node ${i}`,
      type: nodeTypes[Math.floor(nodeTypes.length * Math.random())],
      x: 0 + 200 * x,
      y: 0 + 200 * y,
    });
  }
  // link each node to another node
  for (let i = 1; i < numNodes; i++) {
    generatedSample.edges.push({
      source: `a${i}`,
      target: `a${i + 1}`,
      type: edgeTypes[Math.floor(edgeTypes.length * Math.random())],
    });
  }

  return generatedSample;
}

type IGraphProps = {};

type IGraphState = {
  graph: any,
  selected: any,
  totalNodes: number,
  copiedNode: any,
  layoutEngineType?: LayoutEngineType,
  side1SelectedNode : any,
  side2SelectedNode : any,
  side1Nodes : any,
  side2Nodes : any,
//EITAN

};

class Graph extends React.Component<IGraphProps, IGraphState> {
  GraphView;

  constructor(props: IGraphProps) {
    super(props);

    this.state = {
      copiedNode: null,
      graph: sample,
      layoutEngineType: undefined,
      selected: null,
      totalNodes: sample.nodes.length,
      side1SelectedNode : {"name" : localStorage.getItem('artist1')},
      side2SelectedNode : {"name" : localStorage.getItem('artist2')},
      side1Nodes : [],
      side2Nodes : [],
    };

    this.GraphView = React.createRef();
  }


   componentDidMount(){
    const token = localStorage.getItem('token');
    const artist1 = localStorage.getItem('artist1');
    const artist2 = localStorage.getItem('artist2');

    fetchData(artist1,artist2,token)
    .then(
      (result) => {
          console.log(result['artist1']['name']);
          const newSample: IGraph = {
            edges: [
            ],
            nodes: [
            ],
          };
          const numRelated = result['related1'].length;
          console.log("RELATED " + numRelated);
          const ySpace = 200;
          const xSpace = 400;
          const startX1 = 1000;
          const startX2 = 0;

          var artist1Node = {
              id: result['artist1']['id'],
              subtype: SPECIAL_CHILD_SUBTYPE,
              title: result['artist1']['name'],
              type: EMPTY_TYPE,
              x: startX1,
              y: 0,
              side: 1,
          };
          newSample.nodes.push(artist1Node);
          this.state.side1SelectedNode = artist1Node;

          var artist2Node = {
              id: result['artist2']['id'],
              subtype: SPECIAL_CHILD_SUBTYPE,
              title: result['artist2']['name'],
              type: EMPTY_TYPE,
              x: startX2,
              y: 0,
              side: 2,
          };
          newSample.nodes.push(artist2Node);
          this.state.side2SelectedNode = artist2Node;

          const startY = -1 * (numRelated/2 * ySpace);

            for(var i=0; i<numRelated; i++){
              var newNode = {
                  id: result['related1'][i]['id'],
                  subtype: SPECIAL_CHILD_SUBTYPE,
                  title: result['related1'][i]['name'],
                  type: EMPTY_TYPE,
                  x: startX1 - xSpace,
                  y: startY + i*ySpace,
                  side: 1,
              };
              newSample.nodes.push(newNode);
              this.state.side1Nodes.push(newNode);
              newSample.edges.push({
                  handleText: result['related1'][i]["genresInCommon"],
                  handleTooltipText: '',
                  source: result['artist1']['id'],
                  target: result['related1'][i]['id'],
                  type: SPECIAL_EDGE_TYPE,
                });
            }

            for(var i=0; i<numRelated; i++){
              var newNode = {
                  id: result['related2'][i]['id'],
                  subtype: SPECIAL_CHILD_SUBTYPE,
                  title: result['related2'][i]['name'],
                  type: EMPTY_TYPE,
                  x: startX2 + xSpace,
                  y: startY + i*ySpace,
                  side: 2
              };
              newSample.nodes.push(newNode);
              this.state.side2Nodes.push(newNode);
              newSample.edges.push({
                  handleText: result['related2'][i]["genresInCommon"],
                  handleTooltipText: '',
                  source: result['artist2']['id'],
                  target: result['related2'][i]['id'],
                  type: SPECIAL_EDGE_TYPE,
                });
            }

          const newState = {
              copiedNode: null,
              graph: newSample,
              layoutEngineType: undefined,
              selected: null,
              totalNodes: sample.nodes.length,
            };

          this.setState(newState);


        });

}

  // Helper to find the index of a given node
  getNodeIndex(searchNode: INode | any) {
    return this.state.graph.nodes.findIndex(node => {
      return node[NODE_KEY] === searchNode[NODE_KEY];
    });
  }

  // Helper to find the index of a given edge
  getEdgeIndex(searchEdge: IEdge) {
    return this.state.graph.edges.findIndex(edge => {
      return (
        edge.source === searchEdge.source && edge.target === searchEdge.target
      );
    });
  }

  // Given a nodeKey, return the corresponding node
  getViewNode(nodeKey: string) {
    const searchNode = {};

    searchNode[NODE_KEY] = nodeKey;
    const i = this.getNodeIndex(searchNode);

    return this.state.graph.nodes[i];
  }

//EITAN READ THIS CODE IT MIGHT BE EASIER
  makeItLarge = () => {
    const graph = this.state.graph;
    const generatedSample = generateSample(this.state.totalNodes);

    graph.nodes = generatedSample.nodes;
    graph.edges = generatedSample.edges;
    this.setState(this.state);
  };

  addStartNode = () => {
    const graph = this.state.graph;

    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [
      {
        id: Date.now(),
        title: 'Node A',
        type: SPECIAL_TYPE,
        x: 0,
        y: 0,
      },
      ...this.state.graph.nodes,
    ];
    this.setState({
      graph,
    });
  };

  expandMap = () => {


    //returns node index if it exists, -1 if not
    function isNodeInArray(nodeID, nodeArray){
      for(var i=0; i<nodeArray.length; i++){
        if(nodeID == nodeArray[i].id){
          console.log("node already in the map");
          return i;
        }
      }
      return -1;
    }

    console.log(this.state.side1SelectedNode);
    console.log(this.state.side2SelectedNode);
    expandData(this.state.side1SelectedNode.id,this.state.side2SelectedNode.id, localStorage.getItem('token'))
    .then(
      (result) => {
        const graph = this.state.graph;
        graph.nodes = [
            ...this.state.graph.nodes,
        ];
        //EXPAND MAP
        const xSpace = 500;
        const ySpace = 200;
        const startY1 = this.state.side1SelectedNode.y;
        const startX1 = this.state.side1SelectedNode.x;
        const startY2 = this.state.side2SelectedNode.y;
        const startX2 = this.state.side2SelectedNode.x;


        const expandBy = [xSpace,-1*xSpace];
        for(var i=0; i<graph.nodes.length; i++){
          var node = graph.nodes[i];
          if(node.side){
            node.x+=expandBy[node.side-1];
          }
          graph[i] = node;
        }

        //ADD NODES TO CHOSEN
        const numRelated = result["related1"].length;

        //SIDE 1
        for(var i=0; i<numRelated; i++){
          const id = result["related1"][i]['id'];
          if(isNodeInArray(id, this.state.side1Nodes)!=-1){
            continue;
          }

          var newNode = {
              id: id,
              subtype: SPECIAL_CHILD_SUBTYPE,
              title: result['related1'][i]['name'],
              type: EMPTY_TYPE,
              x: startX1,
              y: startY1 + i*ySpace,
              side: 1,
          };
          graph.nodes.push(newNode);
          this.state.side1Nodes.push(newNode);

          //DONT FORGET TO ADD NODES TO SIDES

          const otherSide = isNodeInArray(id, this.state.side2Nodes);

          if(otherSide!=-1){
            graph.edges.push({
                handleText: '',
                handleTooltipText: '',
                source: id,
                target: this.state.side2Nodes[otherSide],
                type: SPECIAL_EDGE_TYPE,
              });
          }

          graph.edges.push({
              handleText: result['related1'][i]["genresInCommon"],
              handleTooltipText: '',
              source: this.state.side1SelectedNode.id,
              target: id,
              type: SPECIAL_EDGE_TYPE,
            });
        }


        //SIDE2
        for(var i=0; i<numRelated; i++){
          const id = result["related2"][i]['id'];
          if(isNodeInArray(id, this.state.side2Nodes)!=-1){
            continue;
          }

          var newNode = {
              id: id,
              subtype: SPECIAL_CHILD_SUBTYPE,
              title: result['related2'][i]['name'],
              type: EMPTY_TYPE,
              x: startX2,
              y: startY2 + i*ySpace,
              side: 1,
          };
          graph.nodes.push(newNode);
          this.state.side2Nodes.push(newNode);


          const otherSide = isNodeInArray(id, this.state.side1Nodes);

          if(otherSide!=-1){
            graph.edges.push({
            handleText: '',
            handleTooltipText: '',
            source: id,
            target: this.state.side1Nodes[otherSide],
            type: SPECIAL_EDGE_TYPE,
            });
          }

          graph.edges.push({
              handleText: result['related2'][i]["genresInCommon"],
              handleTooltipText: '',
              source: this.state.side2SelectedNode.id,
              target: id,
              type: SPECIAL_EDGE_TYPE,
            });
        }

        var newState = this.state;
        newState.layoutEngineType = "SnapToGrid";
        newState.graph = graph;
        this.setState(newState);
      }
    );
  };

  deleteStartNode = () => {
    const graph = this.state.graph;

    graph.nodes.splice(0, 1);
    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [...this.state.graph.nodes];
    this.setState({
      graph,
    });
  };

  handleChange = (event: any) => {
    this.setState(
      {
        totalNodes: parseInt(event.target.value || '0', 10),
      },
      this.makeItLarge
    );
  };

  /*
   * Handlers/Interaction
   */

  // Called by 'drag' handler, etc..
  // to sync updates from D3 with the graph
  onUpdateNode = (viewNode: INode) => {
    const graph = this.state.graph;
    const i = this.getNodeIndex(viewNode);

    graph.nodes[i] = viewNode;
    this.setState({ graph });
  };

  // Node 'mouseUp' handler
  onSelectNode = (viewNode: INode | null) => {
    var newState = this.state;

    console.log(viewNode);

    if(this.state.side1Nodes.includes(viewNode)){
      newState.side1SelectedNode = viewNode;
      console.log("SIDE 1");
    }
    else if(this.state.side2Nodes.includes(viewNode)){
      newState.side2SelectedNode = viewNode;
      console.log("SIDE 2");
    }
    newState.selected = viewNode;
    // Deselect events will send Null viewNode
    this.setState(newState);
  };

  // Edge 'mouseUp' handler
  onSelectEdge = (viewEdge: IEdge) => {
    this.setState({ selected: viewEdge });
  };

  // Updates the graph with a new node
  onCreateNode = (x: number, y: number) => {
    const graph = this.state.graph;

    // This is just an example - any sort of logic
    // could be used here to determine node type
    // There is also support for subtypes. (see 'sample' above)
    // The subtype geometry will underlay the 'type' geometry for a node
    const type = Math.random() < 0.25 ? SPECIAL_TYPE : EMPTY_TYPE;

    const viewNode = {
      id: Date.now(),
      title: '',
      type,
      x,
      y,
    };

    graph.nodes = [...graph.nodes, viewNode];
    this.setState({ graph });
  };

  // Deletes a node from the graph
  onDeleteNode = (viewNode: INode, nodeId: string, nodeArr: INode[]) => {
    const graph = this.state.graph;
    // Delete any connected edges
    const newEdges = graph.edges.filter((edge, i) => {
      return (
        edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
      );
    });

    graph.nodes = nodeArr;
    graph.edges = newEdges;

    this.setState({ graph, selected: null });
  };


  // Creates a new node between two edges
  onCreateEdge = (sourceViewNode: INode, targetViewNode: INode) => {
    const graph = this.state.graph;
    // This is just an example - any sort of logic
    // could be used here to determine edge type
    const type =
      sourceViewNode.type === SPECIAL_TYPE
        ? SPECIAL_EDGE_TYPE
        : EMPTY_EDGE_TYPE;

    const viewEdge = {
      source: sourceViewNode[NODE_KEY],
      target: targetViewNode[NODE_KEY],
      type,
    };

    // Only add the edge when the source node is not the same as the target
    if (viewEdge.source !== viewEdge.target) {
      graph.edges = [...graph.edges, viewEdge];
      this.setState({
        graph,
        selected: viewEdge,
      });
    }
  };

  // Called when an edge is reattached to a different target.
  onSwapEdge = (
    sourceViewNode: INode,
    targetViewNode: INode,
    viewEdge: IEdge
  ) => {
    const graph = this.state.graph;
    const i = this.getEdgeIndex(viewEdge);
    const edge = JSON.parse(JSON.stringify(graph.edges[i]));

    edge.source = sourceViewNode[NODE_KEY];
    edge.target = targetViewNode[NODE_KEY];
    graph.edges[i] = edge;
    // reassign the array reference if you want the graph to re-render a swapped edge
    graph.edges = [...graph.edges];

    this.setState({
      graph,
      selected: edge,
    });
  };

  // Called when an edge is deleted
  onDeleteEdge = (viewEdge: IEdge, edges: IEdge[]) => {
    const graph = this.state.graph;

    graph.edges = edges;
    this.setState({
      graph,
      selected: null,
    });
  };

  onUndo = () => {
    // Not implemented
    console.warn('Undo is not currently implemented in the example.');
    // Normally any add, remove, or update would record the action in an array.
    // In order to undo it one would simply call the inverse of the action performed. For instance, if someone
    // called onDeleteEdge with (viewEdge, i, edges) then an undelete would be a splicing the original viewEdge
    // into the edges array at position i.
  };

  onCopySelected = () => {
    if (this.state.selected.source) {
      console.warn('Cannot copy selected edges, try selecting a node instead.');

      return;
    }

    const x = this.state.selected.x + 10;
    const y = this.state.selected.y + 10;

    this.setState({
      copiedNode: { ...this.state.selected, x, y },
    });
  };

  onPasteSelected = () => {
    if (!this.state.copiedNode) {
      console.warn(
        'No node is currently in the copy queue. Try selecting a node and copying it with Ctrl/Command-C'
      );
    }

    const graph = this.state.graph;
    const newNode = { ...this.state.copiedNode, id: Date.now() };

    graph.nodes = [...graph.nodes, newNode];
    this.forceUpdate();
  };

  handleChangeLayoutEngineType = (event: any) => {
    this.setState({
      layoutEngineType: (event.target.value: LayoutEngineType | 'None'),
    });
  };

  onSelectPanNode = (event: any) => {
    if (this.GraphView) {
      this.GraphView.panToNode(event.target.value, true);
    }
  };

  /*
   * Render
   */

  render() {
    const { nodes, edges } = this.state.graph;
    const selected = this.state.selected;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;
    return (
      <div id="graph">
        <div className="graph-header">
          <button onClick={this.deleteStartNode}>Delete Node</button>
          <button onClick={this.expandMap}>Expand Map</button>
          <p>Side 1 selected artist : {this.state.side1SelectedNode.title}</p>
          <p>Side 2 selected artist : {this.state.side2SelectedNode.title}</p>
          <div className="layout-engine">
            <span>Layout Engine:</span>
            <select
              name="layout-engine-type"
              onChange={this.handleChangeLayoutEngineType}
            >
              <option value={undefined}>None</option>
              <option value={'SnapToGrid'}>Snap to Grid</option>
              <option value={'VerticalTree'}>Vertical Tree</option>
            </select>
          </div>
          <div className="pan-list">
            <span>Pan To:</span>
            <select onChange={this.onSelectPanNode}>
              {nodes.map(node => (
                <option key={node[NODE_KEY]} value={node[NODE_KEY]}>
                  {node.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <GraphView
          ref={el => (this.GraphView = el)}
          nodeKey={NODE_KEY}
          nodes={nodes}
          edges={edges}
          selected={selected}
          nodeTypes={NodeTypes}
          nodeSubtypes={NodeSubtypes}
          edgeTypes={EdgeTypes}
          onSelectNode={this.onSelectNode}
          onCreateNode={this.onCreateNode}
          onUpdateNode={this.onUpdateNode}
          onDeleteNode={this.onDeleteNode}
          onSelectEdge={this.onSelectEdge}
          onCreateEdge={this.onCreateEdge}
          onSwapEdge={this.onSwapEdge}
          onDeleteEdge={this.onDeleteEdge}
          onUndo={this.onUndo}
          onCopySelected={this.onCopySelected}
          onPasteSelected={this.onPasteSelected}
          layoutEngineType={this.state.layoutEngineType}
        />
      </div>
    );
  }
}

export default Graph;
