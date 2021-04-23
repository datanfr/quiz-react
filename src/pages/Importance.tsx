import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import classes from './ChooseCategory.module.css';


let cx = classNames.bind(classes);

interface Props { }
interface State { }

class Importance extends PureComponent<Props, State> {


  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {

    return <div className={cx("container", "page")}>
      <div className={cx("container", "text")}>
      </div>
      <div className={cx("container", "slider")}>
      </div>
      <div className={cx("container", "slider-hint")}>
      </div>
      <div className={cx("container", "buttons")}>
      </div>
    </div>
  }
}

export default Importance