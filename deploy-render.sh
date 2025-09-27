#!/bin/bash

# 移动端版本部署脚本 - Render平台
# 用于部署到Render平台的自动化脚本

set -e

echo "🚀 开始部署移动端艺术平台到Render..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要的工具
check_requirements() {
    echo -e "${BLUE}📋 检查部署要求...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Node.js/npm未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有要求已满足${NC}"
}

# 清理和准备
prepare_deployment() {
    echo -e "${BLUE}🧹 准备部署环境...${NC}"
    
    # 清理node_modules
    if [ -d "node_modules" ]; then
        echo "清理根目录node_modules..."
        rm -rf node_modules
    fi
    
    if [ -d "client/node_modules" ]; then
        echo "清理客户端node_modules..."
        rm -rf client/node_modules
    fi
    
    if [ -d "server/node_modules" ]; then
        echo "清理服务端node_modules..."
        rm -rf server/node_modules
    fi
    
    # 清理构建文件
    if [ -d "client/build" ]; then
        echo "清理客户端构建文件..."
        rm -rf client/build
    fi
    
    echo -e "${GREEN}✅ 环境准备完成${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装依赖...${NC}"
    
    # 安装根目录依赖
    echo "安装根目录依赖..."
    npm install
    
    # 安装客户端依赖
    echo "安装客户端依赖..."
    cd client
    npm install
    cd ..
    
    # 安装服务端依赖
    echo "安装服务端依赖..."
    cd server
    npm install
    cd ..
    
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 构建前端
build_frontend() {
    echo -e "${BLUE}🔨 构建前端应用...${NC}"
    
    cd client
    npm run build
    cd ..
    
    echo -e "${GREEN}✅ 前端构建完成${NC}"
}

# 检查构建结果
check_build() {
    echo -e "${BLUE}🔍 检查构建结果...${NC}"
    
    if [ ! -d "client/build" ]; then
        echo -e "${RED}❌ 前端构建失败，build目录不存在${NC}"
        exit 1
    fi
    
    if [ ! -f "client/build/index.html" ]; then
        echo -e "${RED}❌ 前端构建失败，index.html不存在${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 构建结果检查通过${NC}"
}

# 创建部署文件
create_deployment_files() {
    echo -e "${BLUE}📄 创建部署文件...${NC}"
    
    # 创建render.yaml
    cat > render.yaml << EOF
services:
  # 后端服务
  - type: web
    name: platform-mobile-backend
    env: node
    plan: free
    buildCommand: |
      cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: MONGODB_URI
        fromDatabase:
          name: platform-program-db
          property: connectionString
      - key: ALLOWED_ORIGINS
        value: https://platform-mobile.onrender.com,https://platform-mobile-frontend.onrender.com,https://hwartplatform.org,https://www.hwartplatform.org,https://mobile.hwartplatform.org,https://ipad.hwartplatform.org

  # 前端服务
  - type: web
    name: platform-mobile-frontend
    env: static
    buildCommand: |
      cd client && npm install && npm run build
    staticPublishPath: client/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://platform-mobile-backend.onrender.com

databases:
  - name: platform-program-db
    databaseName: platform-program
    user: platform-program-user
EOF
    
    echo -e "${GREEN}✅ 部署文件创建完成${NC}"
}

# 提交到Git
commit_to_git() {
    echo -e "${BLUE}📝 提交到Git...${NC}"
    
    # 添加所有文件
    git add .
    
    # 提交更改
    git commit -m "🚀 部署移动端版本到Render - $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的更改需要提交"
    
    echo -e "${GREEN}✅ Git提交完成${NC}"
}

# 推送到远程仓库
push_to_remote() {
    echo -e "${BLUE}📤 推送到远程仓库...${NC}"
    
    # 获取当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    
    # 推送到当前分支
    git push origin $CURRENT_BRANCH
    
    echo -e "${GREEN}✅ 推送到远程仓库完成${NC}"
    echo -e "${YELLOW}📋 当前分支: $CURRENT_BRANCH${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo -e "${GREEN}🎉 部署准备完成！${NC}"
    echo ""
    echo -e "${BLUE}📋 部署信息:${NC}"
    echo -e "  • 项目名称: 海淀外国语国际部艺术平台 - 移动端"
    echo -e "  • 目标平台: Render"
    echo -e "  • 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo -e "${YELLOW}📝 下一步操作:${NC}"
    echo -e "  1. 访问 Render Dashboard"
    echo -e "  2. 创建新的Web Service"
    echo -e "  3. 连接GitHub仓库"
    echo -e "  4. 选择此项目仓库"
    echo -e "  5. 配置环境变量"
    echo -e "  6. 部署服务"
    echo ""
    echo -e "${BLUE}🔗 相关链接:${NC}"
    echo -e "  • Render Dashboard: https://dashboard.render.com"
    echo -e "  • 项目文档: README.md"
    echo -e "  • 部署配置: render.yaml"
    echo ""
    echo -e "${GREEN}✨ 移动端版本已准备就绪！${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}🎨 海淀外国语国际部艺术平台 - 移动端部署脚本${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    check_requirements
    prepare_deployment
    install_dependencies
    build_frontend
    check_build
    create_deployment_files
    commit_to_git
    push_to_remote
    show_deployment_info
}

# 错误处理
trap 'echo -e "${RED}❌ 部署过程中发生错误${NC}"; exit 1' ERR

# 执行主函数
main "$@"
