import React, {Component} from 'react';
import { Tabs, } from 'antd';
import History from './History.js';
import Search from './Search.js';
import MyTrip from './MyTrip.js';

const { TabPane } = Tabs;

class Home extends Component {
  state = {
      activeTab: "1",
      city: "",
      dates: [],
  }

  update = (city, dates) => {
    //search's responsibility
      this.setState({
          city,
          dates,
          activeTab: "2"
      })
  }

  tabsOnChange = (key) => {
      this.setState( {
          activeTab: key
      })
  }


   render() {
       return (
         <Tabs activeKey={this.state.activeTab} onChange={this.tabsOnChange}>
            <TabPane tab="Search" key="1">
              <Search update = {this.update}/>
            </TabPane>
            <TabPane tab="My Trip" key="2">
                <MyTrip datesList = {this.state.dates} cityName = {this.state.city}/>
            </TabPane>
            <TabPane tab="History" key="3">
              <History />
            </TabPane>
          </Tabs>
       );
   }
}

export default Home;
