import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Quill from 'quill';

/**
 * @param {import('quill').default} quill - The Quill instance.
 * @returns {Object} A limited, read-only editor accessor.
 */
const makeUnprivilegedEditor = (quill) => ({
  getLength: () => quill.getLength(),
  getText: (index, length) => quill.getText(index, length),
  getHTML: () => quill.root.innerHTML,
  getContents: (index, length) => quill.getContents(index, length),
  getSelection: (focus) => quill.getSelection(focus),
  getBounds: (index, length) => quill.getBounds(index, length),
});

/**
 * @param {Object} props
 * @param {string} [props.value] - Controlled HTML value (from Ant Design Form.Item).
 * @param {string} [props.placeholder]
 * @param {Object} [props.modules] - Quill modules config (toolbar, clipboard, ...).
 * @param {string[]} [props.formats] - Allowed formats whitelist.
 * @param {string} [props.className]
 * @param {Object} [props.style]
 * @param {boolean} [props.readOnly]
 * @param {(html: string, delta: Object, source: string, editor: Object) => void} [props.onChange]
 */
const QuillEditor = forwardRef(function QuillEditor(props, ref) {
  const {
    value,
    placeholder,
    modules,
    formats,
    className,
    style,
    readOnly = false,
    onChange,
    // eslint-disable-next-line no-unused-vars
    preserveWhitespace, // accepted for parity with react-quill; Quill 2 handles whitespace semantically
    ...rest
  } = props;

  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef('');

  // Keep the latest onChange without re-initialising the editor.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialise Quill exactly once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const editorContainer = container.appendChild(document.createElement('div'));
    const quill = new Quill(editorContainer, {
      theme: 'snow',
      readOnly,
      placeholder,
      formats,
      modules,
    });
    quillRef.current = quill;

    // Seed initial content (matchers in `modules.clipboard` run during convert).
    if (value) {
      const delta = quill.clipboard.convert({ html: value });
      quill.setContents(delta, Quill.sources.SILENT);
    }
    lastHtmlRef.current = quill.root.innerHTML;

    quill.on(Quill.events.TEXT_CHANGE, (delta, _oldDelta, source) => {
      const html = quill.root.innerHTML;
      lastHtmlRef.current = html;
      if (source === Quill.sources.SILENT) return;
      onChangeRef.current?.(html, delta, source, makeUnprivilegedEditor(quill));
    });

    return () => {
      quillRef.current = null;
      container.innerHTML = '';
    };
    // Intentionally run once; modules/formats are memoised by the parent.
  }, []);

  // Reflect external readOnly changes.
  useEffect(() => {
    quillRef.current?.enable(!readOnly);
  }, [readOnly]);

  // Controlled value sync: only apply when the incoming value is genuinely
  // different from what the editor already contains. This is what prevents a
  // fresh paste from being clobbered by its own echoed form value.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value == null) return;
    if (value === lastHtmlRef.current || value === quill.root.innerHTML) return;

    const selection = quill.getSelection();
    const delta = quill.clipboard.convert({ html: value });
    quill.setContents(delta, Quill.sources.SILENT);
    lastHtmlRef.current = quill.root.innerHTML;
    if (selection) {
      const length = quill.getLength();
      const index = Math.min(selection.index, Math.max(length - 1, 0));
      quill.setSelection(index, 0, Quill.sources.SILENT);
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => quillRef.current,
      get unprivilegedEditor() {
        return quillRef.current ? makeUnprivilegedEditor(quillRef.current) : null;
      },
      focus: () => quillRef.current?.focus(),
      blur: () => quillRef.current?.blur(),
    }),
    [],
  );

  return <div className={className} style={style} ref={containerRef} {...rest} />;
});

export default QuillEditor;
