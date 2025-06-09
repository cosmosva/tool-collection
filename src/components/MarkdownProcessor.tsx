'use client';

import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';

// 动态导入类型
type MarkdownIt = any;
type Html2Canvas = any;
type JsPDF = any;

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
  const [md, setMd] = useState<MarkdownIt | null>(null);

  // 动态加载 markdown-it 和相关依赖
  useEffect(() => {
    const loadMarkdownIt = async () => {
      try {
        const [MarkdownIt, hljs] = await Promise.all([
          import('markdown-it'),
          import('highlight.js')
        ]);
        
        const mdInstance = new MarkdownIt.default({
          html: true,
          linkify: true,
          typographer: true,
          highlight: function (str: string, lang: string) {
            if (lang && hljs.default.getLanguage(lang)) {
              try {
                return hljs.default.highlight(str, { language: lang }).value;
              } catch (__) {}
            }
            return '';
          }
        });
        
        setMd(mdInstance);
        setRenderedHtml(mdInstance.render(markdown));
      } catch (error) {
        console.error('Failed to load markdown-it:', error);
        setRenderedHtml('<p>Markdown 加载失败，请刷新页面重试</p>');
      }
    };

    loadMarkdownIt();
  }, []);

  // 更新渲染的 HTML
  useEffect(() => {
    if (md) {
      setRenderedHtml(md.render(markdown));
    }
  }, [markdown, md]);

  // 转换为 HTML
  const convertToHtml = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html' });
    saveAs(blob, 'document.html');
  };

  // 转换为 Word (使用简单的HTML格式)
  const convertToWord = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Markdown Document</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${renderedHtml}
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    saveAs(blob, 'document.doc');
  };

  // 转换为 Excel (提取表格)
  const convertToExcel = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(renderedHtml, 'text/html');
    const tables = doc.querySelectorAll('table');
    
    if (tables.length === 0) {
      alert('文档中没有找到表格数据');
      return;
    }

    let csvContent = '';
    tables.forEach((table, index) => {
      if (index > 0) csvContent += '\n\n';
      csvContent += `表格 ${index + 1}\n`;
      
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => 
          '"' + cell.textContent?.replace(/"/g, '""') + '"'
        ).join(',');
        csvContent += rowData + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'tables.csv');
  };

  // 转换为图片
  const convertToImage = async () => {
    setIsLoading(true);
    try {
      const html2canvas = await import('html2canvas');
      const previewElement = document.getElementById('markdown-preview');
      if (!previewElement) return;

      const canvas = await html2canvas.default(previewElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'markdown-preview.png');
        }
      });
    } catch (error) {
      console.error('转换图片失败:', error);
      alert('转换图片失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 转换为 PDF
  const convertToPdf = async () => {
    setIsLoading(true);
    try {
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const previewElement = document.getElementById('markdown-preview');
      if (!previewElement) return;

      const canvas = await html2canvas.default(previewElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.default();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('markdown-document.pdf');
    } catch (error) {
      console.error('转换PDF失败:', error);
      alert('转换PDF失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const exportButtons = [
    { label: 'HTML', action: convertToHtml, icon: '🌐', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Word', action: convertToWord, icon: '📄', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Excel', action: convertToExcel, icon: '📊', color: 'bg-green-500 hover:bg-green-600' },
    { label: '图片', action: convertToImage, icon: '🖼️', color: 'bg-pink-500 hover:bg-pink-600' },
    { label: 'PDF', action: convertToPdf, icon: '📑', color: 'bg-red-500 hover:bg-red-600' },
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

        {/* 导出按钮 */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {exportButtons.map((button) => (
              <button
                key={button.label}
                onClick={button.action}
                disabled={isLoading}
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
                <span className="text-sm text-gray-500">支持语法高亮</span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="flex-1 p-4 resize-none border-none outline-none font-mono text-sm leading-relaxed"
                placeholder="在这里输入 Markdown 内容..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* 预览区域 */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">预览效果</h3>
                <span className="text-sm text-gray-500">实时渲染</span>
              </div>
              <div 
                id="markdown-preview"
                className="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">支持的功能：</h4>
              <ul className="space-y-1">
                <li>• 实时 Markdown 预览</li>
                <li>• 语法高亮代码块</li>
                <li>• 表格、引用、链接</li>
                <li>• 多种格式导出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">导出说明：</h4>
              <ul className="space-y-1">
                <li>• HTML: 纯净的网页格式</li>
                <li>• Word: 兼容的文档格式</li>
                <li>• Excel: 提取表格数据</li>
                <li>• 图片/PDF: 基于预览生成</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 