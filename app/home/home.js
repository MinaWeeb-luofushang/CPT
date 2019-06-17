import React, {Component} from 'react';
import {StyleSheet, View,Image,Text,ImageBackground} from "react-native";
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idText:'ID：',
            igText:'积分：',
            user:'',
            userIg:''
        };
        //绑定事件
        this.judge = this.judge.bind(this);
    }
    //跳转时加载
    componentDidMount() {
        this.judge();
        if (this.props.userIG!=null){
            this.setState({userIg:this.props.userIG})
        }
    }
    //异步获取信息
    judge(){
        StorageUtil.getJsonObject('key').then(data=>{
            var values = JSON.parse(data)
            this.setState({
                user:values,
                userIg:values.Integral
            })
        })
    }
    render() {
        return (
            <View style={styles.homeAll}>
                {/*头部*/}
                <View style={styles.homeHeader}>
                    <View style={styles.headerImg}>
                        <Image source={require("../../img/home/user.jpg")} style={styles.headerImg_}/>
                    </View>
                    <View style={styles.headerId}>
                        <Text style={styles.headerIdText}>{this.state.idText}{this.state.user.ID}</Text>
                        <View style={styles.headerIg}>
                            <Image source={require('../../img/home/jifen.png')} style={styles.headerIgImg}/>
                            <Text style={styles.headerIgText}>{this.state.igText}{this.state.userIg}</Text>
                        </View>
                    </View>
                    <Text style={styles.homeExit} onPress={()=>{Actions.login(),StorageUtil.remove('key')}}>
                        <Image source={require('../../img/home/tuichu.png')} style={styles.imgExit}/>
                    </Text>
                </View>
                {/*内容分成两列*/}
                <View style={styles.indexContent}>
                    <ImageBackground style={styles.gemeOne} source={require('../../img/home/game1.jpg')} >
                        <Text style={{flex:1}} onPress={()=>Actions.load()}></Text>
                    </ImageBackground>

                    <ImageBackground style={styles.gemeTwo} source={require('../../img/home/game2.jpg')} >
                        <Text style={{flex:1}} onPress={()=>Actions.turntable({'user':this.state.user})}></Text>
                    </ImageBackground>

                    <ImageBackground style={styles.gemeThere} source={require('../../img/home/game3.jpg')} >
                        <Text style={{flex:1}} onPress={()=>Actions.turntable()}></Text>
                    </ImageBackground>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    homeAll:{
        flex:1,
        backgroundColor:'#07C2D3',
    },
    homeHeader:{
        flex:1,
        backgroundColor: '#366B83',
        flexDirection:'row',
    },
    headerImg:{
        padding:5
    },
    headerImg_:{
        width:80,
        height:80
    },
    headerId:{
        top:'5%',
        borderRadius:20,
        alignItems:'center',
    },
    headerIdText:{
        marginLeft:-10,
        fontSize:14,
        color:'#FFF'
    },
    headerIg:{
        height:'42%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerIgImg:{
        width: 23,
        height:23
    },
    headerIgText:{
        fontSize:14,
        textAlign: 'center',
        color:'#FFF'
    },
    homeExit:{
        position:'absolute',
        // width:36,
        // height:23,
        top:'10%',
        left:'80%',
        right:'1%',
        bottom:'10%',
        alignItems:'center',
        paddingLeft:22
    },
    imgExit:{
        width:40,
        height:40
    },
    indexContent:{
        flex:6,
        backgroundColor: '#66BAA0',
        padding: 10,
        flexDirection:'row'
    },
    gemeOne:{
        height:'60%',
        flex:1
    },
    gemeTwo:{
        flex:1,
        marginLeft:10,
        height:'60%',
    },
    gemeThere:{
        flex:1,
        marginLeft:10,
        height:'60%',
    }
});
export default Home;