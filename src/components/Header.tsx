import { PureComponent } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'


interface Props {onBackClick?: () => void}
interface State {}

class Header extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0
    }
  }

  render() {
    const { onBackClick, ...remains } = this.props
    return <div className={cx("flex", "flex-static", "space-between")}>
      <div className={cx("flex", 'margin', 'align-center')}  onClick={() => onBackClick && onBackClick()}>
         <FontAwesomeIcon icon={faChevronLeft}/>
      </div>
      <div className={cx("flex", 'margin')}>
        <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
      </div>
    </div>
  }
}

export default Header