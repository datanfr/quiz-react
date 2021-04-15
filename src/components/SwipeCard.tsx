import { PureComponent } from 'react';


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
    return <div {...remains} onClick={e => this.setState({count: this.state.count + 1})}>
        Hello {name}, i've been clicked {this.state.count} times
    </div>
  }
}

export default Component