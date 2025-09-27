#!/bin/bash

# 移动端版本启动脚本
# 用于本地开发和测试

set -e

echo "🚀 启动移动端艺术平台..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js版本
check_node_version() {
    echo -e "${BLUE}📋 检查Node.js版本...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        echo -e "${GREEN}✅ Node.js版本: $NODE_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js版本: $NODE_VERSION (推荐 >= $REQUIRED_VERSION)${NC}"
    fi
}

# 检查npm版本
check_npm_version() {
    echo -e "${BLUE}📋 检查npm版本...${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm未安装${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm版本: $NPM_VERSION${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装依赖...${NC}"
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
        echo "安装根目录依赖..."
        npm install
        
        echo "安装客户端依赖..."
        cd client
        npm install
        cd ..
        
        echo "安装服务端依赖..."
        cd server
        npm install
        cd ..
        
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ 依赖已安装${NC}"
    fi
}

# 检查环境变量
check_env_vars() {
    echo -e "${BLUE}🔍 检查环境变量...${NC}"
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  未找到.env文件，创建默认配置...${NC}"
        
        cat > .env << EOF
# 移动端版本环境配置
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/platform-program
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://platform-program.onrender.com
MAX_FILE_SIZE=52428800
MAX_FILES=10
EOF
        
        echo -e "${GREEN}✅ 已创建默认.env文件${NC}"
        echo -e "${YELLOW}📝 请根据需要修改.env文件中的配置${NC}"
    else
        echo -e "${GREEN}✅ 找到.env文件${NC}"
    fi
}

# 启动后端服务
start_backend() {
    echo -e "${BLUE}🔧 启动后端服务...${NC}"
    
    cd server
    
    # 检查端口是否被占用
    if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  端口5001已被占用，尝试停止现有服务...${NC}"
        pkill -f "node.*server/index.js" || true
        sleep 2
    fi
    
    # 启动后端服务
    nohup npm start > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend_pid
    
    cd ..
    
    # 等待后端启动
    echo "等待后端服务启动..."
    sleep 5
    
    # 检查后端是否启动成功
    if curl -s http://localhost:5001/health > /dev/null; then
        echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}❌ 后端服务启动失败${NC}"
        echo "查看日志: tail -f logs/backend.log"
        exit 1
    fi
}

# 启动前端服务
start_frontend() {
    echo -e "${BLUE}🎨 启动前端服务...${NC}"
    
    cd client
    
    # 检查端口是否被占用
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  端口3001已被占用，尝试停止现有服务...${NC}"
        pkill -f "react-scripts start" || true
        sleep 2
    fi
    
    # 设置端口环境变量
    export PORT=3001
    
    # 启动前端服务
    nohup npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend_pid
    
    cd ..
    
    echo -e "${GREEN}✅ 前端服务启动中 (PID: $FRONTEND_PID)${NC}"
    echo -e "${YELLOW}⏳ 前端服务启动需要一些时间，请稍候...${NC}"
}

# 创建日志目录
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        echo -e "${GREEN}✅ 创建日志目录${NC}"
    fi
}

# 显示服务信息
show_services_info() {
    echo ""
    echo -e "${GREEN}🎉 移动端艺术平台启动完成！${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "${YELLOW}📋 服务信息:${NC}"
    echo -e "  • 前端地址: http://localhost:3001"
    echo -e "  • 后端地址: http://localhost:5001"
    echo -e "  • 健康检查: http://localhost:5001/health"
    echo ""
    echo -e "${BLUE}📝 日志文件:${NC}"
    echo -e "  • 后端日志: tail -f logs/backend.log"
    echo -e "  • 前端日志: tail -f logs/frontend.log"
    echo ""
    echo -e "${YELLOW}🔧 管理命令:${NC}"
    echo -e "  • 停止服务: ./stop-mobile.sh"
    echo -e "  • 重启服务: ./restart-mobile.sh"
    echo -e "  • 查看状态: ./status-mobile.sh"
    echo ""
    echo -e "${GREEN}✨ 移动端版本已启动，请在iPad Safari中测试！${NC}"
    echo -e "${BLUE}💡 提示: 确保MongoDB服务正在运行${NC}"
}

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}🛑 正在停止服务...${NC}"
    
    # 停止后端
    if [ -f ".backend_pid" ]; then
        BACKEND_PID=$(cat .backend_pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo -e "${GREEN}✅ 后端服务已停止${NC}"
        fi
        rm -f .backend_pid
    fi
    
    # 停止前端
    if [ -f ".frontend_pid" ]; then
        FRONTEND_PID=$(cat .frontend_pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo -e "${GREEN}✅ 前端服务已停止${NC}"
        fi
        rm -f .frontend_pid
    fi
}

# 设置清理陷阱
trap cleanup EXIT INT TERM

# 主函数
main() {
    echo -e "${GREEN}🎨 海淀外国语国际部艺术平台 - 移动端版本${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    check_node_version
    check_npm_version
    create_logs_dir
    install_dependencies
    check_env_vars
    start_backend
    start_frontend
    
    # 等待前端完全启动
    echo -e "${YELLOW}⏳ 等待前端服务完全启动...${NC}"
    sleep 10
    
    show_services_info
    
    # 保持脚本运行
    echo -e "${BLUE}按 Ctrl+C 停止所有服务${NC}"
    while true; do
        sleep 1
    done
}

# 错误处理
trap 'echo -e "${RED}❌ 启动过程中发生错误${NC}"; cleanup; exit 1' ERR

# 执行主函数
main "$@"
