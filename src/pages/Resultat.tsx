import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';


let cx = classNames;

interface Props { }
interface State { }

class Resultat extends PureComponent<Props, State> {

  params : URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
  }

  componentDidMount() {
  }

  render() {

    return <div>
      <div className={cx("fullscreen", "flex", "column")}>
        <Header />
        <div className={cx("margin")}>
          <h4>Résultats</h4>
        </div>
      </div>
    </div>
  }
}

export default Resultat