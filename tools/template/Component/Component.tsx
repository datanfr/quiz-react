import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import classes from './Component.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

let cx = classNames.bind(classes);

interface Props {name:string}
interface State {count:number}

class Component extends PureComponent<Props, State> {

  constructor(props : Props) {
    super(props);
    this.state = {
        count: 0
    }
  }

  render() {
    const {name, ...remains} = this.props
    return <div className={cx("some-style")} {...remains} onClick={e => this.setState({count: this.state.count + 1})}>
        <FontAwesomeIcon icon={faHome} /> Hello {name}, i've been clicked {this.state.count} times
    </div>
  }
}

export default Component