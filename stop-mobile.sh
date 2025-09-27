#!/bin/bash

# 移动端版本停止脚本
# 用于停止本地开发服务

echo "🛑 停止移动端艺术平台..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止后端服务
stop_backend() {
    echo -e "${BLUE}🔧 停止后端服务...${NC}"
    
    if [ -f ".backend_pid" ]; then
        BACKEND_PID=$(cat .backend_pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo -e "${GREEN}✅ 后端服务已停止 (PID: $BACKEND_PID)${NC}"
        else
            echo -e "${YELLOW}⚠️  后端服务进程不存在${NC}"
        fi
        rm -f .backend_pid
    else
        echo -e "${YELLOW}⚠️  未找到后端PID文件${NC}"
    fi
    
    # 额外清理：杀死所有相关的Node.js进程
    pkill -f "node.*server/index.js" 2>/dev/null && echo -e "${GREEN}✅ 清理后端相关进程${NC}" || true
}

# 停止前端服务
stop_frontend() {
    echo -e "${BLUE}🎨 停止前端服务...${NC}"
    
    if [ -f ".frontend_pid" ]; then
        FRONTEND_PID=$(cat .frontend_pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo -e "${GREEN}✅ 前端服务已停止 (PID: $FRONTEND_PID)${NC}"
        else
            echo -e "${YELLOW}⚠️  前端服务进程不存在${NC}"
        fi
        rm -f .frontend_pid
    else
        echo -e "${YELLOW}⚠️  未找到前端PID文件${NC}"
    fi
    
    # 额外清理：杀死所有相关的React进程
    pkill -f "react-scripts start" 2>/dev/null && echo -e "${GREEN}✅ 清理前端相关进程${NC}" || true
}

# 检查端口占用
check_ports() {
    echo -e "${BLUE}🔍 检查端口占用...${NC}"
    
    # 检查后端端口
    if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口5001仍被占用${NC}"
        lsof -Pi :5001 -sTCP:LISTEN
    else
        echo -e "${GREEN}✅ 端口5001已释放${NC}"
    fi
    
    # 检查前端端口
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  端口3001仍被占用${NC}"
        lsof -Pi :3001 -sTCP:LISTEN
    else
        echo -e "${GREEN}✅ 端口3001已释放${NC}"
    fi
}

# 清理临时文件
cleanup_temp_files() {
    echo -e "${BLUE}🧹 清理临时文件...${NC}"
    
    # 清理PID文件
    rm -f .backend_pid .frontend_pid
    
    # 清理日志文件（可选）
    if [ "$1" = "--clean-logs" ]; then
        if [ -d "logs" ]; then
            rm -rf logs/*
            echo -e "${GREEN}✅ 日志文件已清理${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ 临时文件清理完成${NC}"
}

# 显示状态
show_status() {
    echo ""
    echo -e "${BLUE}📋 服务状态:${NC}"
    
    # 检查后端
    if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  • 后端服务: ${RED}运行中${NC} (端口5001)"
    else
        echo -e "  • 后端服务: ${GREEN}已停止${NC}"
    fi
    
    # 检查前端
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  • 前端服务: ${RED}运行中${NC} (端口3001)"
    else
        echo -e "  • 前端服务: ${GREEN}已停止${NC}"
    fi
}

# 主函数
main() {
    echo -e "${GREEN}🎨 海淀外国语国际部艺术平台 - 移动端版本${NC}"
    echo -e "${BLUE}================================================${NC}"
    
    stop_backend
    stop_frontend
    
    # 等待进程完全停止
    sleep 2
    
    check_ports
    cleanup_temp_files "$@"
    show_status
    
    echo ""
    echo -e "${GREEN}✅ 移动端艺术平台已停止${NC}"
    echo -e "${BLUE}💡 使用 ./start-mobile.sh 重新启动服务${NC}"
}

# 错误处理
set -e

# 执行主函数
main "$@"
