import React, {Component} from 'react'
import throttle from 'debounce'

import AutoComplete from 'antd/lib/auto-complete'
import message from 'antd/lib/message'

const PLUGIN = "General";

export default class Copy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      dataSource: [],
      dataSet: []
    };
  }

  componentDidMount = () => {
    this.setState({query: this.props.store.working_dir});
    this.props.setModalInfo({
      title: 'Copy',
      okText: 'Copy',
      cancelText: 'Close',
    });
  };

  handleOk = () => {
    const sources = [];
    this.props.store.list.forEach(item=>{
      if(item.selected)
        sources.push(item.basename);
    });
    this.props.store.Request(PLUGIN, "copy", {destination: this.state.query, sources})
      .then(({data}) => {
        message.success(data.message);
        this.props.store.refresh();
        this.props.close();
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  onSearchInput = throttle(e => {
    this.setState({query: e});
    if (e === '')
      e = '/';
    this.props.store.httpPost({
      plugin: PLUGIN,
      alias: 'scan_dir',
      working_dir: '/',
      payload: {query: e}
    })
      .then(({data}) => {
        const dataSource = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].is_dir)
            dataSource.push(data[i].full_path);
        }
        this.setState({dataSet: data, dataSource});
      })
      .catch(err => {
        console.log(err);
        message.error(err.response.data.message);
      });
  }, 300);

  onSearchSelect = e => {
    const exists = this.state.dataSet.find(x => x.full_path === e);
    if (!exists) {
      message.error('This directory does not exist');
      return;
    }

    this.setState({query: exists.full_path});
  };

  render = () => {
    return (
      <AutoComplete
        style={{width: '100%'}}
        value={this.state.query}
        dataSource={this.state.dataSource}
        onSelect={this.onSearchSelect}
        onSearch={this.onSearchInput}
        placeholder="Copy To"
        prefixCls="qxui-select"
      />
    );
  };
}