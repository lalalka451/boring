# GoToFuture React - 飞向未来

一个使用 React + TypeScript + Zustand 构建的完整放置类文明发展游戏。从石器时代一路发展到多维宇宙时代，通过资源管理、建筑建造、时代进化和重生机制，体验文明的无限扩张。

## 🎮 游戏特色

### 核心玩法
- **时代进化**: 从石器时代发展到多维宇宙时代，每个时代都有独特的建筑和资源
- **资源管理**: 管理人口、食物、木材、石头等多种资源，建立复杂的生产链
- **建筑系统**: 建造各种功能建筑，分配工人，优化生产效率
- **重生机制**: 达到条件后可以重生，获得永久倍率加成
- **大数字系统**: 支持超大数值，使用BigInt确保数值精度

### 技术特色
- **React 18**: 使用最新的React特性和Hooks
- **TypeScript**: 完整的类型安全，提供更好的开发体验
- **Zustand**: 轻量级状态管理，支持持久化存储
- **响应式设计**: 适配桌面和移动设备
- **模块化架构**: 清晰的组件结构，易于维护和扩展

### 游戏系统
- **离线收益**: 关闭游戏后仍可获得最多3小时的离线收益
- **自动保存**: 使用Zustand persist中间件自动保存游戏进度
- **成就系统**: 解锁各种成就，记录游戏里程碑
- **迷你游戏**: 钓鱼、车位、老虎机等小游戏获得特殊奖励
- **数据驱动架构**: JSON配置文件，支持热更新和远程数据加载

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发模式
```bash
npm run dev
# 或
yarn dev
```

游戏将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 预览生产版本
```bash
npm run preview
# 或
yarn preview
```

## 🎯 游戏目标

1. **资源积累**: 收集并管理各种资源，建立高效的生产链
2. **时代进步**: 满足条件后进入下一个时代，解锁新的建筑和技术
3. **文明扩张**: 不断扩大人口规模和生产能力
4. **重生循环**: 通过重生获得永久加成，实现指数级增长

## 🆕 最新更新

### v2.0 - 数据驱动架构 + 工人管理系统
- ✅ **完整的工人管理**: 可视化工人分配界面，实时效率计算
- ✅ **数据驱动架构**: JSON配置文件，支持热更新和版本控制
- ✅ **运行时验证**: Zod schema确保数据完整性
- ✅ **性能优化**: 修复了工人效率计算算法
- ✅ **用户体验**: 改进的UI反馈和操作提示
- ✅ **文档完善**: 完整的技术文档和API指南

## 🕹️ 操作指南

### 基本操作
- **点击建筑卡片**: 对于可点击的建筑（如人树），点击可获得资源
- **Ctrl + 点击建筑**: 建造一个该类型的建筑
- **建造按钮**: 点击建筑卡片上的"🏗️ 建造"按钮
- **Ctrl + S**: 手动保存游戏

### 资源管理
- **人口**: 可分配给建筑工作的工人数量
- **食物**: 维持人口生存，不足会导致人口减少
- **基础资源**: 木材、石头等建造建筑的基础材料
- **高级资源**: 随时代解锁的特殊资源，如青铜、钢铁、芯片等

### 建筑系统
- **生产建筑**: 产出各种资源，需要分配工人
- **住房建筑**: 提供人口容量上限
- **特殊建筑**: 提供特殊效果或解锁新功能

### 工人管理系统 (新增)
- **工人分配**: 使用 ➕➖ 按钮分配工人到建筑
- **效率计算**: 基于工人数量的实时生产效率计算
- **策略优化**: 平衡工人分配以最大化资源产出
- **视觉反馈**: 实时显示工人分配状态和建议配置

## 📁 项目结构

```
gotofuturereact/
├── src/
│   ├── components/          # React组件
│   │   ├── tabs/           # 标签页组件 (建筑、迷你游戏、成就、统计)
│   │   ├── modals/         # 模态框组件
│   │   ├── minigames/      # 迷你游戏组件 (钓鱼、车位、老虎机)
│   │   ├── BuildingCard.tsx # 建筑卡片 (含工人管理界面)
│   │   ├── Sidebar.tsx     # 侧边栏 (资源显示、玩家信息)
│   │   └── ActivityLog.tsx # 活动日志
│   ├── store/              # Zustand状态管理
│   │   └── gameStore.ts    # 游戏状态和逻辑
│   ├── data/               # 数据驱动架构 (JSON配置)
│   │   ├── eras.json       # 时代定义和进化条件
│   │   ├── resources.json  # 资源属性和解锁条件
│   │   ├── buildings.json  # 建筑配置和生产链
│   │   ├── achievements.json # 成就定义和奖励
│   │   ├── gameData.ts     # 数据加载器
│   │   ├── schema.ts       # Zod验证模式
│   │   └── dataLoader.ts   # 高级数据加载 (支持远程)
│   ├── types/              # TypeScript类型定义
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 全局样式
│   └── main.tsx            # 应用入口点
├── public/                 # 静态资源
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目说明
```

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式**: CSS3 + CSS Grid/Flexbox
- **图标**: Unicode Emoji
- **数值处理**: BigInt (原生支持)

## 🎨 自定义和扩展

### 添加新时代
编辑 `src/data/gameData.ts` 中的 `eras` 对象，添加新的时代定义

### 添加新建筑
在 `gameData.ts` 的 `buildings` 对象中定义新的建筑类型

### 添加新资源
在 `gameData.ts` 的 `resources` 对象中添加新的资源类型

### 修改游戏平衡
调整 `gameData.ts` 中的数值，无需修改组件代码

### 添加新组件
在 `src/components/` 目录下创建新的React组件

## 🌐 浏览器兼容性

- Chrome 67+ (支持BigInt)
- Firefox 68+ (支持BigInt)
- Safari 14+ (支持BigInt)
- Edge 79+ (支持BigInt)

## 📝 开发说明

这是一个现代化的React游戏项目，展示了以下最佳实践：

- **TypeScript集成**: 完整的类型安全和智能提示
- **状态管理**: 使用Zustand进行轻量级状态管理
- **组件化设计**: 高度模块化的组件结构
- **性能优化**: 合理使用React Hooks和状态更新
- **持久化存储**: 自动保存游戏状态到localStorage
- **响应式设计**: 移动端友好的界面设计

适合作为学习React开发、TypeScript应用、游戏开发或项目架构设计的参考。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

🚀 **开始你的文明发展之旅吧！从一棵树开始，建设属于你的多维宇宙帝国！**
