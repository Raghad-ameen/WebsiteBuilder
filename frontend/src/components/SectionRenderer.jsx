import React, { useState } from 'react';
import { DndContext, DragOverlay, rectIntersection, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
// أيقونات محسنة
const MoveIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-700 " fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const Handle = ({ type, position, onMouseDown }) => (
  <div
    onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, type); }}
    className="absolute w-3 h-3 border-2 border-indigo-600 rounded-full z-150 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
    style={{ ...position, transform: 'translate(-50%, -50%)', cursor: `${type}-resize` }}
  />
);

const FreeTransformElement = ({ id, item, updateItem, onRemove, isSelected, 
  onSelect ,setIsMovingElement }) => {
  const [activeHandle, setActiveHandle] = useState(null);
  const safeId = String(id);

  const handleMoveStart = (e) => {
  e.stopPropagation();
   setIsMovingElement(true);
   if (e.button !== 0) return;

  const startX = e.clientX;
  const startY = e.clientY;

  const origX = item.x || 0;
  const origY = item.y || 0;

  const move = (m) => {
    updateItem(id, {
      x: origX + (m.clientX - startX),
      y: origY + (m.clientY - startY)
    });
  };

  const up = () => {
      setIsMovingElement(false);
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  };

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
};

  const handleResizeStart = (e, type) => {
  e.stopPropagation();
  
  // 🟢 1. حفظ الحالة الحالية في التاريخ قبل بدء التغيير
  // استدعاء saveToHistory هنا يضمن أن الـ Undo سيعيدك للحجم الأصلي
  if (typeof saveToHistory === 'function') {
      saveToHistory(); 
  }

  setActiveHandle(type);
  onSelect(id);

  const startW = item.width || 100;
  const startH = item.height || 40;
  const startX = e.clientX;
  const startY = e.clientY;
  const startPosX = item.x || 0;
  const startPosY = item.y || 0;

  const resize = (m) => {
    let nW = startW;
    let nH = startH;
    let nX = startPosX;
    let nY = startPosY;

    if (type.includes('e')) nW = Math.max(30, startW + (m.clientX - startX));
    if (type.includes('w')) {
      nW = Math.max(30, startW - (m.clientX - startX));
      nX = startPosX + (m.clientX - startX);
    }
    if (type.includes('s')) nH = Math.max(20, startH + (m.clientY - startY));
    if (type.includes('n')) {
      nH = Math.max(20, startH - (m.clientY - startY));
      nY = startPosY + (m.clientY - startY);
    }

    // تحديث العنصر أثناء الحركة
    updateItem(id, { width: nW, height: nH, x: nX, y: nY });
  };

  const stop = () => {
    setActiveHandle(null);
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stop);
  };

  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stop);
};

  const handles = [
    { type: 'nw', position: { top: '0%', left: '0%' } },
    { type: 'ne', position: { top: '0%', left: '100%' } },
    { type: 'se', position: { top: '100%', left: '100%' } },
    { type: 'sw', position: { top: '100%', left: '0%' } }
  ];

  return (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(id, e); }}
      className={`free-element absolute group 
    `}
    style={{
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: item.width ? `${item.width}px` : '200px', // 👈 يفضل وضع قيمة افتراضية
      height: item.height ? `${item.height}px` : 'auto',
      outline: isSelected ? '2px dashed #4f46e5' : 'none',
      outlineOffset: '2px',
      backgroundColor: 'transparent', // 👈 تأكد أن الخلفية شفافة دائماً
      display: 'block', 
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: isSelected ? 9999 : 10,
    }}
  >
 
      {/* Move */}
      <div
        onMouseDown={handleMoveStart}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-move z-110"
      >
        <MoveIcon />
      </div>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-4 -right-4 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 z-120"
      >
        <TrashIcon />
      </button>

      {/* Content */}
      {/* Content الحاوية المسؤولة عن المحتوى */}
<div className="w-full h-full relative z-100 flex items-center justify-center bg-transparent overflow-hidden">
  {item.type === 'image' ? (
    <img src={item.src} className="w-full h-full object-contain " alt="" />
  ) : item.type === 'link' ? (
    <a className="w-full h-full flex items-center justify-center text-center no-underline">
      {item.text}
    </a>
  ) : (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => updateItem(id, { text: e.target.innerText })}
      className="w-full h-full outline-none bg-transparent bg-none shadow-none flex items-center justify-center text-center cursor-text"
      style={{ 
        // نضمن هنا أن النص لا يأخذ خلفية بيضاء من المتصفح
        backgroundColor: 'transparent',
        border: 'none',
        wordBreak: 'break-word'
      }}
    >
      {item.text}
    </div>
  )}
</div>

      {isSelected &&
        handles.map((h) => (
          <Handle key={h.type} type={h.type} position={h.position} onMouseDown={handleResizeStart} />
        ))}
    </div>
  );
};

const SectionRenderer = ({ section, updateSectionData, isSelected, onElementClick, selectedElementIds, setIsMovingElement, ElementWrapper }) => {
  const { data } = section;

  const handleUpdate = (newData) => updateSectionData(section.id, newData);

  return (
    <div
      className="w-full relative group/section"
      style={{
        backgroundColor: data.styles?.backgroundColor || 'transparent', 
        minHeight: parseInt(data.styles?.height) || 400,
        position: 'relative',
        overflow: 'visible', // مهم جداً لبقاء المقابض (Handles) ظاهرة
        zIndex: isSelected ? 10 : 1, // رفع السكشن المختار قليلاً
      }}
    >
      {/* 🟢 طبقة العناصر الذرية - تم تصحيح الطبقات والتفاعل */}
      <div className="absolute inset-0 z-20 pointer-events-auto bg-transparent">
        {(data.items || []).map((item) => (
          <ElementWrapper
            key={item.id}
            element={item}
            sectionId={section.id}
            // تحويل الـ ID لنص لضمان المطابقة
            onSelect={(id, e) => onElementClick(e, String(id), section.id)}
            setIsMovingElement={setIsMovingElement}
            updateItem={(id, newData) => {
              const updated = data.items.map((it) =>
                it.id === id ? { ...it, ...newData, styles: { ...(it.styles || {}), ...(newData.styles || {}) } } : it
              );
              handleUpdate({ items: updated });
            }}
            onRemove={() => {
              const updated = data.items.filter((it) => it.id !== item.id);
              handleUpdate({ items: updated });
            }}
            isSelected={selectedElementIds?.map(String).includes(String(item.id))}
          />
        ))}
      </div>

      {/* Resize Handle للسكشن */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-500/0 hover:bg-indigo-500/40 cursor-ns-resize z-50 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startH = e.currentTarget.parentElement.offsetHeight;
          const startY = e.clientY;
          const move = (m) => handleUpdate({ styles: { ...data.styles, height: `${startH + (m.clientY - startY)}px` } });
          const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
        }}
      />
    </div>
  );
};

export default SectionRenderer;