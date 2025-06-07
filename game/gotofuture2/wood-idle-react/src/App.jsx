import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  gatherWood, 
  buySawmill, 
  produceWood, 
  loadGame, 
  resetGame,
  GameActions
} from './GameManager'
import { addLog, LogManager } from './LogManager'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const gameState = useSelector(state => state.game)
  const logs = useSelector(state => state.logs.logs)
  const { resources, buildings, population } = gameState

  // Save game to localStorage
  const saveGame = useCallback(() => {
    GameActions.saveGame(resources, buildings)
  }, [resources, buildings])

  // Load game from localStorage
  const loadGameFromStorage = useCallback(() => {
    const data = GameActions.loadGameData()
    if (data) {
      dispatch(loadGame(data))
      dispatch(addLog(LogManager.systemLog('游戏加载成功')))
    }
  }, [dispatch])

  // Manual wood gathering
  const handleGatherWood = () => {
    dispatch(gatherWood())
    dispatch(addLog(LogManager.resourceLog('收集了 1 木材')))
    saveGame()
  }

  // Buy sawmill
  const handleBuySawmill = () => {
    if (resources.wood < buildings.sawmill.cost.wood) {
      dispatch(addLog(LogManager.errorLog('需要更多木材！')))
      return
    }
    dispatch(buySawmill())
    dispatch(addLog(LogManager.buildingLog('购买了 1 锯木厂')))
    saveGame()
  }

  // Reset game
  const handleResetGame = () => {
    if (window.confirm('确定要重置游戏吗？所有进度将丢失。')) {
      localStorage.removeItem('woodIdleGame')
      dispatch(resetGame())
      dispatch(addLog(LogManager.systemLog('游戏已重置')))
    }
  }

  // Manual save
  const handleManualSave = () => {
    saveGame()
    dispatch(addLog(LogManager.systemLog('游戏已手动保存')))
  }

  // Load game on component mount
  useEffect(() => {
    loadGameFromStorage()
  }, [loadGameFromStorage])

  // Auto-production loop with auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (buildings && buildings.sawmill) {
        const woodProduced = buildings.sawmill.count * buildings.sawmill.rate
        if (woodProduced > 0) {
          dispatch(produceWood(woodProduced))
          dispatch(addLog(LogManager.resourceLog(`锯木厂生产了 ${woodProduced.toFixed(1)} 木材`)))
        }
        // Auto-save on each tick, regardless of production
        saveGame()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [buildings, dispatch, saveGame])

  // 完全移除这个防护条件
  // if (!buildings || !buildings.sawmill) {
  //   return <div>加载游戏数据中...</div>
  // }

  // 使用可选链和默认值
  const sawmillCount = buildings?.sawmill?.count || 0;
  const shelterCount = buildings?.shelter?.count || 0;

  return (
    <div className="game-container">
      <div className="top-buttons">
        <button onClick={handleManualSave}>保存</button>
        <button onClick={handleResetGame}>重置</button>
      </div>

      <h2>资源</h2>
      <div className="resources">
        <div>木材: {resources.wood.toFixed(1)}</div>
        <div>人口: {population.total} (空闲: {population.available})</div>
      </div>

      <h2>手动收集</h2>
      <button onClick={handleGatherWood}>点击收集木材 (+1)</button>

      <h2>建筑</h2>
      <button onClick={handleBuyShelter}>
        建造简陋居所 – {buildings?.shelter?.cost?.wood || 20} 木材
        {shelterCount > 0 && ` (已拥有 ${shelterCount} 个)`}
      </button>
      <div className="building-info">每个居所提供 {buildings?.shelter?.population || 5} 人口</div>
      
      <button onClick={handleBuySawmill}>
        购买锯木厂 – {buildings?.sawmill?.cost?.wood || 10} 木材
        {sawmillCount > 0 && ` (已拥有 ${sawmillCount} 个)`}
      </button>
      <div className="building-info">
        每个锯木厂需要 {buildings?.sawmill?.workers || 1} 人口，每秒生产 {buildings?.sawmill?.rate || 0.5} 木材
      </div>

      <div className="log">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App












