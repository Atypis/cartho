# Custom Nodes

**Source:** https://reactflow.dev/learn/customization/custom-nodes
**Scraped:** 2025-10-13T10:07:53.365Z

---

# Custom Nodes

A powerful feature of React Flow is the ability to create custom nodes. This gives you the flexibility to render anything you want within your nodes. We generally recommend creating your own custom nodes rather than relying on built-in ones. With custom nodes, you can add as many source and target [handles](/learn/customization/handles) as you like—or even embed form inputs, charts, and other interactive elements.

In this section, we’ll walk through creating a custom node featuring an input field that updates text elsewhere in your application. For further examples, we recommend checking out our [Custom Node Example](/examples/nodes/custom-node).

## Implementing a custom node[](#implementing-a-custom-node)

To create a custom node, all you need to do is create a React component. React Flow will automatically wrap it in an interactive container that injects essential props like the node’s id, position, and data, and provides functionality for selection, dragging, and connecting handles. For a full overview on all available node props, see the [Node](/api-reference/types/node-props) reference.

### Create the component[](#create-the-component)

Let’s dive into an example by creating a custom node called `TextUpdaterNode`. For this, we’ve added a simple input field with a change handler.

`export function TextUpdaterNode(props) {   const onChange = useCallback((evt) => {     console.log(evt.target.value);   }, []);     return (     <div className="text-updater-node">       <div>         <label htmlFor="text">Text:</label>         <input id="text" name="text" onChange={onChange} className="nodrag" />       </div>     </div>   ); }`

### Initialize nodeTypes[](#initialize-nodetypes)

You can add a new node type to React Flow by adding it to the `nodeTypes` prop like below. We define the `nodeTypes` outside of the component to prevent re-renderings.

`const nodeTypes = {   textUpdater: TextUpdaterNode, };`

### Pass nodeTypes to React Flow[](#pass-nodetypes-to-react-flow)

`<ReactFlow   nodes={nodes}   edges={edges}   nodeTypes={nodeTypes}   onNodesChange={onNodesChange}   onEdgesChange={onEdgesChange}   fitView />`

### Update node definitions[](#update-node-definitions)

After defining your new node type, you can use it by specifying the `type` property on your node definition:

`const nodes = [   {     id: 'node-1',     type: 'textUpdater',     position: { x: 0, y: 0 },     data: { value: 123 },   }, ];`

### Flow with custom node[](#flow-with-custom-node)

After putting all together and adding some basic styles we get a custom node that prints text to the console:

## Full code example 🏁[](#full-code-example-)

To enable your custom node to connect with other nodes, check out the [Handles](/learn/customization/handles) page to learn how to add source and target handles.