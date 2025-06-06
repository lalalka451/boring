import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import './MiniGames.css';

interface ParkingGameProps {
  onClose: () => void;
}

interface Car {
  id: number;
  type: string;
  spot: number;
  earnings: number;
}

const carTypes = ['🚗', '🚙', '🚕', '🚐', '🚓', '🚑'];

const ParkingGame: React.FC<ParkingGameProps> = ({ onClose }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [money, setMoney] = useState(0);
  const [occupiedSpots, setOccupiedSpots] = useState<Set<number>>(new Set());
  
  const { resources, formatNumber } = useGameStore();
  const geniusCoins = resources.genius_coins?.amount || 0n;

  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prevCars => 
        prevCars.map(car => ({
          ...car,
          earnings: car.earnings + 1
        }))
      );
      setMoney(prev => prev + cars.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [cars.length]);

  const buycar = () => {
    const cost = 10;
    if (Number(geniusCoins) < cost) return;

    const emptySpots = Array.from({ length: 16 }, (_, i) => i).filter(
      spot => !occupiedSpots.has(spot)
    );

    if (emptySpots.length === 0) return;

    // Deduct cost
    useGameStore.setState({
      resources: {
        ...resources,
        genius_coins: {
          ...resources.genius_coins!,
          amount: geniusCoins - BigInt(cost)
        }
      }
    });

    const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const randomCarType = carTypes[Math.floor(Math.random() * carTypes.length)];
    
    const newCar: Car = {
      id: Date.now(),
      type: randomCarType,
      spot: randomSpot,
      earnings: 0
    };

    setCars(prev => [...prev, newCar]);
    setOccupiedSpots(prev => new Set([...prev, randomSpot]));
  };

  const collectMoney = () => {
    if (money > 0) {
      useGameStore.setState({
        resources: {
          ...resources,
          genius_coins: {
            ...resources.genius_coins!,
            amount: geniusCoins + BigInt(money)
          }
        }
      });
      setMoney(0);
    }
  };

  const removeCar = (carId: number) => {
    setCars(prev => {
      const carToRemove = prev.find(car => car.id === carId);
      if (carToRemove) {
        setOccupiedSpots(prevSpots => {
          const newSpots = new Set(prevSpots);
          newSpots.delete(carToRemove.spot);
          return newSpots;
        });
      }
      return prev.filter(car => car.id !== carId);
    });
  };

  return (
    <div className="minigame-modal" onClick={onClose}>
      <div className="minigame-content" onClick={(e) => e.stopPropagation()}>
        <div className="minigame-header">
          <h3>🚗 车位小游戏</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="parking-area">
          <div className="parking-info">
            <div className="info-item">
              <span>收入: {money} 天才币</span>
              <button 
                className="collect-btn" 
                onClick={collectMoney}
                disabled={money === 0}
              >
                💰 收取
              </button>
            </div>
            <div className="info-item">
              <span>你的天才币: {formatNumber(geniusCoins)}</span>
              <button 
                className="buy-car-btn" 
                onClick={buycar}
                disabled={Number(geniusCoins) < 10 || occupiedSpots.size >= 16}
              >
                🚗 购买汽车 (10 天才币)
              </button>
            </div>
          </div>
          
          <div className="parking-grid">
            {Array.from({ length: 16 }, (_, i) => {
              const car = cars.find(c => c.spot === i);
              return (
                <div 
                  key={i} 
                  className={`parking-spot ${car ? 'occupied' : 'empty'}`}
                  onClick={() => car && removeCar(car.id)}
                  title={car ? `点击移除汽车 (已赚取 ${car.earnings} 天才币)` : '空车位'}
                >
                  {car ? car.type : '🅿️'}
                </div>
              );
            })}
          </div>
          
          <div className="parking-stats">
            <div className="stat">
              <span>停车位: {occupiedSpots.size}/16</span>
            </div>
            <div className="stat">
              <span>每2秒收入: {cars.length} 天才币</span>
            </div>
          </div>
          
          <div className="parking-tips">
            <h4>游戏说明：</h4>
            <ul>
              <li>花费10天才币购买一辆汽车</li>
              <li>每辆汽车每2秒产生1天才币</li>
              <li>点击汽车可以移除它</li>
              <li>最多同时停放16辆汽车</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingGame;
