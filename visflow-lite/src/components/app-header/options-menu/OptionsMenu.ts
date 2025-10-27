import { storeToRefs } from 'pinia'
import { usePanelsStore } from '@/stores/panels'
import { useDataflowStore } from '@/stores/dataflow'

export function useOptionsMenu() {
  const panelsStore = usePanelsStore()
  const dataflowStore = useDataflowStore()
  const { nodePanelVisible } = storeToRefs(panelsStore)
  const { toggleNodePanel } = panelsStore

  function testAddNode() {
    // Create a test node at random position
    const x = Math.random() * 500 + 100
    const y = Math.random() * 300 + 100
    const node = dataflowStore.createNode('data-source', x, y)
    
    // If canvas is ready, add it to DOM
    if (dataflowStore.canvas) {
      dataflowStore.canvas.addNode(node)
    }
  }

  return {
    nodePanelVisible,
    toggleNodePanel,
    testAddNode,
  }
}
