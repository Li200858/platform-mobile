const fs = require('fs');
const path = require('path');

// 检查文件共享情况
function checkFileSharing() {
  console.log('=== 检查文件共享情况 ===');
  
  // 检查本地uploads目录
  const localUploadsDir = path.join(__dirname, 'uploads');
  console.log('\n1. 本地uploads目录:', localUploadsDir);
  console.log('目录是否存在:', fs.existsSync(localUploadsDir));
  
  if (fs.existsSync(localUploadsDir)) {
    const files = fs.readdirSync(localUploadsDir);
    console.log('文件数量:', files.length);
    console.log('文件列表:', files.slice(0, 10)); // 只显示前10个
  }
  
  // 检查生产环境目录
  const prodUploadsDir = '/opt/render/project/src/uploads';
  console.log('\n2. 生产环境uploads目录:', prodUploadsDir);
  console.log('目录是否存在:', fs.existsSync(prodUploadsDir));
  
  if (fs.existsSync(prodUploadsDir)) {
    const files = fs.readdirSync(prodUploadsDir);
    console.log('文件数量:', files.length);
    console.log('文件列表:', files.slice(0, 10)); // 只显示前10个
  }
  
  // 检查环境变量
  console.log('\n3. 环境变量:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SHARED_UPLOAD_DIR:', process.env.SHARED_UPLOAD_DIR);
  
  // 检查两个网站的配置
  console.log('\n4. 配置对比:');
  const mobileUploadsDir = process.env.NODE_ENV === 'production' ? 
    (process.env.SHARED_UPLOAD_DIR || '/opt/render/project/src/uploads') : 'uploads';
  const programUploadsDir = process.env.NODE_ENV === 'production' ? 
    '/opt/render/project/src/uploads' : 'uploads';
  
  console.log('Mobile网站上传目录:', mobileUploadsDir);
  console.log('Program网站上传目录:', programUploadsDir);
  console.log('目录是否相同:', mobileUploadsDir === programUploadsDir);
}

checkFileSharing();
