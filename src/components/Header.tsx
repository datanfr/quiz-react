import { PureComponent } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'


interface Props {onBackClick?: () => void, title?: String}
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
    const borderRight = !!onBackClick ? "1px solid rgba(0,0,0,0.3" : "none"
    return <div className={cx("shadow", "header")}>
      <div className={cx("flex")} style={{justifyContent: "center", alignContent: "center", flex: "0 0 50px", cursor: "pointer", borderRight}}  onClick={() => onBackClick && onBackClick()}>
        <div className={cx("flex", 'margin', {"opacity-hidden ": !onBackClick})} style={{justifyContent: "center"}}>
          <FontAwesomeIcon icon={faChevronLeft}/>
        </div>
      </div>
      <div className={cx("flex", 'margin')} style={{justifyContent: "center", alignContent: "center", flexGrow: 1}}><b>{this.props.title}</b></div>
      <div className={cx("flex", 'margin')} style={{justifyContent: "flex-end", alignContent: "center", flexGrow: 0}}>
        <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
      </div>
    </div>
  }
}

export default Header