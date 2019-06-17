import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Login from "./app/login/login";
import {Router,Scene,Tabs,Actions} from "react-native-router-flux";
import Home from "./app/home/home";
import Over from "./app/over/over";
import Play from "./app/play/play";
import Load from "./app/load/load";
import Turntable from "./app/play/turntable";
import OverTwo from "./app/over/overTwo";


// text

export default class App extends Component<Props> {
  render() {
    return (
        <Router style={styles.container}>
          <Scene
              hideNavBar={true}
              labelStyle={{fontSize:12,height:17}}
              wrap={false}
              showLable={true}
              activeTintColor={'#BC212D'}
              inactiveTintColor={'#9A9A9A'}
              tabBarStyle={{height:51,paddingTop:6}}
              activeBackgroundColor='#FFF'
              inactiveBackgroundColor={'#FFF'}
          >
            <Scene key={'login'} title={'登录'} component={Login} initial={true}/>
            <Scene key={'over'} title={'结算'} component={Over} />
            <Scene key={'play'} title={'游戏'} component={Play}  />
            <Scene key={'home'} title={'首页'} component={Home}/>
            <Scene key={'load'} title={'准备'} component={Load}/>
            <Scene key={'turntable'} title={'转盘'} component={Turntable} />
            <Scene key={'test'} title={'测试'} component={OverTwo}/>

          </Scene>
        </Router>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
    alignItems:'center',
    justifyContent:'center'
  }
});
