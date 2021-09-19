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
    return <div className={cx("shadow", "header")}>
      {onBackClick && <div className={cx("flex", 'margin')} style={{justifyContent: "flex-start", alignContent: "center", flexGrow: 0, justifyItems: ""}}  onClick={() => onBackClick && onBackClick()}>
         <FontAwesomeIcon icon={faChevronLeft}/>
      </div>}
      {this.props.title && <div className={cx("flex", 'margin')} style={{justifyContent: "center", alignContent: "center", flexGrow: 1}}><b>{this.props.title}</b></div>}
      <div className={cx("flex", 'margin')} style={{justifyContent: "flex-end", alignContent: "center", flexGrow: 0}}>
        <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
      </div>
    </div>
  }
}

export default Header