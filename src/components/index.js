import * as React from 'react';
import * as ReactDom from 'react-dom';
import DragResize from './drag-resize';

export default class DragResizeContainer extends React.Component {
  state = {
    parentNode: null,
  }

  componentWillMount() {
    const { layout } = this.props;
    this.childrenMap = transLayoutToMap(layout);
  }

  componentWillReceiveProps(nextProps) {
    this.childrenMap = transLayoutToMap(nextProps.layout);
  }

  onResizeStart = (key) => {
    return (e, direction, refToElement, delta) => {
      const { scale = 1 } = this.props;
      const { onResizeStart } = this.props.resizeProps || {};
      if (onResizeStart) onResizeStart(e, direction, refToElement, delta);
      if (scale === 1) return;
      this.currentChildMap = this.childrenMap[key];
    };
  }

  onResize = (key) => {
    return (e, direction, refToElement, delta) => {
      const { onResize } = this.props.resizeProps || {};
      if (onResize) onResize(e, direction, refToElement, delta);
      const { scale = 1 } = this.props;
      if (scale === 1) return;
      const temp = {
        width: this.currentChildMap.width + (delta.width / scale),
        height: this.currentChildMap.height + (delta.height / scale),
      };
      if (key) this.childrenMap[key] = Object.assign({}, this.childrenMap[key], temp);
      this.onLayoutChange();
    };
  }

  onResizeStop = (key) => {
    return (e, direction, refToElement, delta) => {
      const { onResizeStop } = this.props.resizeProps || {};
      if (onResizeStop) onResizeStop(e, direction, refToElement, delta);
      const { scale = 1 } = this.props;
      if (scale !== 1) return;
      const temp = { width: refToElement.clientWidth, height: refToElement.clientHeight };
      this.currentChildMap = null;
      if (key) this.childrenMap[key] = Object.assign({}, this.childrenMap[key], temp);
      this.onLayoutChange();
    };
  }

  onDragStop = (key) => {
    return (e, position) => {
      const { onStop } = this.props.dragProps || {};
      const { scale = 1 } = this.props;
      if (onStop) onStop(e, position);
      if (scale !== 1) { // if scale exists
        this.onLayoutChange();
        return false;
      }
      const temp = { x: position.x, y: position.y };
      if (key) this.childrenMap[key] = Object.assign({}, this.childrenMap[key], temp);
      this.onLayoutChange();
      this.setState({}); // force update when drag
    };
  }

  onDrag = (key) => {
    return (e, position) => {
      const { onDrag } = this.props.dragProps || {};
      if (onDrag) onDrag(e, position);
      const { scale = 1 } = this.props;
      if (scale === 1) return true; // if scale not exists
      const { deltaX, deltaY } = position;
      const temp = { x: this.childrenMap[key].x + (deltaX / scale), y: this.childrenMap[key].y + (deltaY / scale) };
      if (key) this.childrenMap[key] = Object.assign({}, this.childrenMap[key], temp);
      setTimeout(() => { // prevent draggable setState influence
        this.setState({}); // force update when drag
      }, 0);
    };
  }

  onLayoutChange = () => {
    const { onLayoutChange } = this.props;
    if (onLayoutChange) onLayoutChange(transMapToLayout(this.childrenMap));
  }

  setParentNode = () => {
    const { parentNode } = this.state;
    if (!parentNode) this.setState({ parentNode: ReactDom.findDOMNode(this) });
  }

  render() {
    const { children, dragProps, resizeProps, layout, onLayoutChange, scale, ...other } = this.props;
    const { parentNode } = this.state;
    const defaultProps = {
      parentNode,
    };
    const tempChildren = children instanceof Array ? children : [children];
    return (
      <div {...other} style={contianerStyle} onMouseEnter={this.setParentNode} onTouchStart={this.setParentNode}>
        {tempChildren.map((single) => {
          const key = single.key;
          if (!this.childrenMap[key] && key) this.childrenMap[key] = defaultChildProps;
          return (
            <DragResize
              key={key}
              {...defaultProps}
              resizeProps={Object.assign({}, resizeProps, {
                onResizeStop: this.onResizeStop(key),
                onResizeStart: this.onResizeStart(key),
                onResize: this.onResize(key)
              })}
              dragProps={Object.assign({}, dragProps, { onStop: this.onDragStop(key), onDrag: this.onDrag(key) })}
              childMap={this.childrenMap[key]}
            >
              {single}
            </DragResize>
          );
        })}
      </div>
    );
  }
}

const contianerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const transLayoutToMap = (layout = []) => {
  const childrenMap = {};
  layout.forEach(({ key, ...other }) => {
    if(key) childrenMap[key] = other;
  });
  return childrenMap;
};

const transMapToLayout = (childrenMap = {}) => {
  return Object.keys(childrenMap).map((key) => {
    return { key, ...defaultChildProps, ...childrenMap[key] };
  });
};

const defaultChildProps = { x: 0, y: 0, width: 200, height: 100, zIndex: 1 };
