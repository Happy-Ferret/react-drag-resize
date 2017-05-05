import * as React from 'react';
import Draggable from 'react-draggable';
import Resizable from 'react-resizable-box';

export default class DragResize extends React.Component {

  onResizeStart = (e, direction, refToElement) => {
    const { onResizeStart } = this.props.resizeProps || {};
    e.stopPropagation();
    if (onResizeStart) onResizeStart(e, direction, refToElement);
  }

  getResizeProps = () => {
    return {
      width: 200,
      height: 100,
      minWidth: 100,
      minHeight: 80,
      ...this.props.resizeProps,
      onResizeStart: this.onResizeStart,
    };
  }

  getDragProps = () => {
    return {
      bounds: 'parent',
      defaultPosition: { x: 0, y: 0 },
      ...this.props.dragProps,
    };
  }

  render() {
    const { children } = this.props;
    return (
      <Draggable {...this.getDragProps()}>
        <div style={boxStyle}>
          <Resizable {...this.getResizeProps()}>
            {children}
          </Resizable>
        </div>
      </Draggable>
    );
  }
}

export const DragResizeContainer = ({ children }) => {
  return <div style={contianerStyle}>{children}</div>;
};

const contianerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const boxStyle = {
  width: 'auto',
  height: 'auto',
  cursor: 'move',
  display: 'inline-block',
  position: 'absolute',
};
