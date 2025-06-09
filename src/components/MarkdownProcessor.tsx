'use client';

import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';

// 类型声明
declare global {
  interface Window {
    mdInstance?: any;
  }
}

const defaultMarkdown = `# Markdown 工具演示

## 功能特色

这是一个强大的 **Markdown 处理工具**，支持：

1. 📖 **实时预览** - 所见即所得的编辑体验
2. 📄 **转换为 Word** - 保持格式的文档转换
3. 📊 **转换为 Excel** - 提取表格数据
4. 🌐 **转换为 HTML** - 纯净的网页格式
5. 🖼️ **转换为图片** - 高质量的PNG图像
6. 📑 **转换为 PDF** - 专业的文档格式

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## 表格示例

| 功能 | 支持 | 说明 |
|------|------|------|
| 预览 | ✅ | 实时渲染 |
| 导出 | ✅ | 多格式支持 |
| 语法高亮 | ✅ | 代码美化 |

## 引用

> 这是一个引用块的例子。
> 
> Markdown 让文档编写变得简单而优雅。

---

**试试编辑左侧的内容，右侧会实时预览！**
`;

export function MarkdownProcessor() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [isMarkdownReady, setIsMarkdownReady] = useState(false);
  const [fileName, setFileName] = useState('untitled.md');

  // 动态加载 markdown-it 和相关依赖
  useEffect(() => {
    let isMounted = true;
    
    const loadMarkdownIt = async () => {
      try {
        const MarkdownIt = await import('markdown-it');
        
        if (!isMounted) return;
        
        const mdInstance = new MarkdownIt.default({
          html: true,
          linkify: true,
          typographer: true,
          highlight: function (str: string, lang: string) {
            // 不使用语法高亮，避免 SSR 问题
            return '';
          }
        });
        
        setRenderedHtml(mdInstance.render(markdown));
        setIsMarkdownReady(true);
        
        // 设置监听器来处理后续的 markdown 变化
        if (typeof window !== 'undefined') {
          window.mdInstance = mdInstance;
        }
      } catch (error) {
        console.error('Failed to load markdown-it:', error);
        if (isMounted) {
          setRenderedHtml('<div class="p-4 text-center text-red-600">Markdown 加载失败，请刷新页面重试</div>');
          setIsMarkdownReady(true);
        }
      }
    };

    loadMarkdownIt();
    
    return () => {
      isMounted = false;
    };
  }, [markdown]);

  // 当 markdown 内容变化时重新渲染
  useEffect(() => {
    if (isMarkdownReady && typeof window !== 'undefined' && window.mdInstance) {
      try {
        setRenderedHtml(window.mdInstance.render(markdown));
      } catch (error) {
        console.error('Rendering error:', error);
        setRenderedHtml('<div class="p-4 text-center text-red-600">渲染失败</div>');
      }
    }
  }, [markdown, isMarkdownReady]);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      alert('请选择 .md 或 .txt 文件');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
    };
    
    reader.onerror = () => {
      alert('文件读取失败，请重试');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // 保存为 MD 文件
  const saveAsMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, fileName);
  };

  // 新建文档
  const createNewDocument = () => {
    if (markdown !== defaultMarkdown && markdown.trim() !== '') {
      if (!confirm('当前文档未保存，确定要新建文档吗？')) {
        return;
      }
    }
    setMarkdown(defaultMarkdown);
    setFileName('untitled.md');
  };

  // 转换为 HTML
  const convertToHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    p { margin-bottom: 16px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-size: 85%; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background-color: #f6f8fa; font-weight: 600; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'markdown-document.html');
  };

  // 转换为 Word
  const convertToWord = () => {
    const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <title>Markdown Document</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1, h2, h3 { color: #2c3e50; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; border: 1px solid #ddd; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    blockquote { border-left: 4px solid #3498db; margin: 0; padding-left: 20px; color: #7f8c8d; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: left; }
    th { background-color: #ecf0f1; font-weight: bold; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    
    const blob = new Blob([wordHtml], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    saveAs(blob, 'markdown-document.doc');
  };

  // 转换为 Excel
  const convertToExcel = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(renderedHtml, 'text/html');
    const tables = doc.querySelectorAll('table');
    
    if (tables.length === 0) {
      alert('文档中没有找到表格数据，无法转换为 Excel 格式');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    tables.forEach((table, index) => {
      if (index > 0) csvContent += '\n\n';
      csvContent += `表格 ${index + 1}\n`;
      
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => {
          const text = cell.textContent?.trim() || '';
          return `"${text.replace(/"/g, '""')}"`;
        }).join(',');
        csvContent += rowData + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'markdown-tables.csv');
  };

  // 转换为图片
  const convertToImage = async () => {
    setIsLoading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const previewElement = document.getElementById('markdown-preview');
      
      if (!previewElement) {
        alert('预览区域未找到，请确保页面已完全加载');
        return;
      }

      // 确保内容已渲染
      if (!previewElement.innerHTML.trim() || previewElement.innerHTML === '') {
        alert('预览内容为空，请先输入一些 Markdown 内容');
        return;
      }

      // 等待一下确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(previewElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        height: previewElement.scrollHeight,
        width: previewElement.scrollWidth,
        scrollX: 0,
        scrollY: 0,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        alert('无法生成图片，请检查预览内容是否正常显示');
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${fileName.replace(/\.md$/, '')}.png`);
        } else {
          alert('图片生成失败，请重试');
        }
      }, 'image/png');
    } catch (error) {
      console.error('转换图片失败:', error);
      alert(`转换图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 转换为 PDF
  const convertToPdf = async () => {
    setIsLoading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const previewElement = document.getElementById('markdown-preview');
      if (!previewElement) {
        alert('预览区域未找到，请确保页面已完全加载');
        return;
      }

      // 确保内容已渲染
      if (!previewElement.innerHTML.trim() || previewElement.innerHTML === '') {
        alert('预览内容为空，请先输入一些 Markdown 内容');
        return;
      }

      // 等待一下确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(previewElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        height: previewElement.scrollHeight,
        width: previewElement.scrollWidth,
        scrollX: 0,
        scrollY: 0,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        alert('无法生成PDF，请检查预览内容是否正常显示');
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 添加额外页面（如果需要）
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName.replace(/\.md$/, '')}.pdf`);
    } catch (error) {
      console.error('转换PDF失败:', error);
      alert(`转换PDF失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 调试功能 - 检查预览区域
  const debugPreview = () => {
    const previewElement = document.getElementById('markdown-preview');
    if (!previewElement) {
      alert('预览区域未找到');
      return;
    }
    
    console.log('预览区域信息:', {
      innerHTML: previewElement.innerHTML.substring(0, 200) + '...',
      scrollHeight: previewElement.scrollHeight,
      scrollWidth: previewElement.scrollWidth,
      clientHeight: previewElement.clientHeight,
      clientWidth: previewElement.clientWidth,
      offsetHeight: previewElement.offsetHeight,
      offsetWidth: previewElement.offsetWidth,
      computedStyle: window.getComputedStyle(previewElement),
    });
    
    alert(`预览区域尺寸: ${previewElement.offsetWidth}x${previewElement.offsetHeight}, 内容长度: ${previewElement.innerHTML.length}`);
  };

  const exportButtons = [
    { label: '保存MD', action: saveAsMarkdown, icon: '💾', color: 'bg-gray-500 hover:bg-gray-600' },
    { label: 'HTML', action: convertToHtml, icon: '🌐', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Word', action: convertToWord, icon: '📄', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Excel', action: convertToExcel, icon: '📊', color: 'bg-green-500 hover:bg-green-600' },
    { label: '图片', action: convertToImage, icon: '🖼️', color: 'bg-pink-500 hover:bg-pink-600' },
    { label: 'PDF', action: convertToPdf, icon: '📑', color: 'bg-red-500 hover:bg-red-600' },
    { label: '调试', action: debugPreview, icon: '🔍', color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Markdown 工具
          </h1>
          <p className="text-gray-600">强大的 Markdown 文档处理与转换工具</p>
        </div>

        {/* 文件操作区域 */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {/* 文件上传 */}
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                accept=".md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="text-lg">📁</span>
                上传文件
              </label>
            </div>

            {/* 新建文档 */}
            <button
              type="button"
              onClick={createNewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span className="text-lg">📝</span>
              新建文档
            </button>

            {/* 当前文件名 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">当前文件:</span>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="text-sm font-mono bg-transparent border-none outline-none text-gray-800 min-w-0 flex-1"
                placeholder="文件名.md"
              />
            </div>
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">导出格式</h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {exportButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={button.action}
                disabled={isLoading || !isMarkdownReady}
                className={`
                  flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium
                  transition-all duration-200 hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${button.color}
                `}
              >
                <span className="text-lg">{button.icon}</span>
                {button.label}
                {isLoading && (button.label === '图片' || button.label === 'PDF') && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 移动端标签切换 */}
        <div className="md:hidden mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              编辑器
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              预览
            </button>
          </div>
        </div>

        {/* 编辑器和预览区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 编辑器 */}
          <div className={`${activeTab === 'edit' ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Markdown 编辑器</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>字符数: {markdown.length}</span>
                  <span>•</span>
                  <span>行数: {markdown.split('\n').length}</span>
                </div>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="flex-1 p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed"
                placeholder="在这里输入 Markdown 内容，或使用上方的【上传文件】按钮加载 .md 文件..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* 预览区域 */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">预览效果</h3>
                <span className="text-sm text-gray-500">
                  {isMarkdownReady ? '实时渲染' : '加载中...'}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div 
                  id="markdown-preview"
                  className="p-6 markdown-body min-h-full"
                  style={{ 
                    backgroundColor: '#ffffff',
                    minHeight: '100%',
                    width: '100%',
                    position: 'relative'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">文件操作：</h4>
              <ul className="space-y-1">
                <li>• 上传 .md 或 .txt 文件</li>
                <li>• 保存当前内容为 .md 文件</li>
                <li>• 新建空白文档</li>
                <li>• 实时字符和行数统计</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">支持的功能：</h4>
              <ul className="space-y-1">
                <li>• 实时 Markdown 预览</li>
                <li>• 表格、引用、链接渲染</li>
                <li>• 响应式编辑界面</li>
                <li>• 多种格式导出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">导出说明：</h4>
              <ul className="space-y-1">
                <li>• 保存MD: 原始 Markdown 格式</li>
                <li>• HTML: 带样式的网页格式</li>
                <li>• Word: 兼容 MS Word 的文档</li>
                <li>• Excel: 提取表格数据为 CSV</li>
                <li>• 图片/PDF: 基于预览区域生成</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 清理函数，防止内存泄漏
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (window.mdInstance) {
      delete window.mdInstance;
    }
  });
} 