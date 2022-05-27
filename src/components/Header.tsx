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
      <div className={cx({"opacity-hidden ": !onBackClick})} style={{position: "relative", float: "left", left: 0, height: "100%", display: "flex", width: "var(--header-height)", cursor: "pointer", zIndex: 999}} onClick={() => onBackClick && onBackClick()}>
          <div style={{backgroundColor: "var(--datan-blue)", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%"}}  >
            <div style={{justifyContent: "center", color: "#ffffff"}}>
              <FontAwesomeIcon icon={faChevronLeft}/>
            </div>
          </div>
      </div>
      <div style={{width: "100%", position: "absolute", height: "100%", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <b>{this.props.title}</b>
      </div>
      <div style={{position: "relative", float: "right", right: "0px", height: "100%",  display: "flex", justifyContent: "center", alignItems: "center", marginRight: "10px"}}>
        <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
      </div>
    </div>
  }
}

export default Header
