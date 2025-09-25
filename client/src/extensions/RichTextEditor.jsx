import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { FontSize } from '@/extensions/FontSize';
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiList
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize
    ],
    content: content,
    editable: true,
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 min-h-[200px] focus:outline-none'
      },
      handleDOMEvents: {
        focus: (view, event) => {
          event.preventDefault();
          return false;
        }
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    }
  });

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const cursorPos = editor.view.state.selection.$head.pos;
      editor.commands.setContent(content);
      editor.commands.setTextSelection(cursorPos);
    }
  }, [content, editor]);

  const handleFocus = () => {
    setIsFocused(true);
    editor?.commands.focus();
  };

  if (!editor) return null;

  const fontSizes = [
    { label: 'Default', value: '16px' },
    { label: 'Small', value: '14px' },
    { label: 'Large', value: '20px' },
    { label: 'Extra Large', value: '24px' }
  ];

  const handleFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
  };

  const handleButtonClick = (callback) => (e) => {
    e.preventDefault();
    callback();
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden ${isFocused ? 'ring-2 ring-emerald-500' : ''}`}
      onClick={handleFocus}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        {/* Font Size Selector */}
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="h-8 px-2 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mr-2"
          value={editor.getAttributes('textStyle').fontSize || ''}
        >
          <option value="">Font Size</option>
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>{size.label}</option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Bold"
        >
          <FiBold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Italic"
        >
          <FiItalic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().toggleUnderline().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Underline"
        >
          <FiUnderline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('left').run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Align Left"
        >
          <FiAlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('center').run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Align Center"
        >
          <FiAlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().setTextAlign('right').run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Align Right"
        >
          <FiAlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-emerald-600' : 'text-gray-600'}`}
          title="Bullet List"
        >
          <FiList className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose max-w-none focus:outline-none cursor-text"
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}

export default RichTextEditor;
