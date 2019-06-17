import React, {Component} from 'react';
import {StyleSheet,View, Image, Text, Button, Dimensions,TouchableOpacity} from "react-native";
import {scaleSizeH, scaleSizeW, setSpText}  from '../../utils/Screen';
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";
import Toast from "react-native-root-toast";

//全局通信变量
var websock;
//获取手机分辨率
const { width, height } = Dimensions.get('window');
class Load extends Component {
    constructor(props) {
        super(props);
        this.state = {
            waitText:'等 待 对 手 加 入...',
            loadText:'准备游戏',
            exitText:'取消游戏',
            vsText:'VS',
            aleNo:'无法准备,返回首页',
            aleYes:'正在准备中。。。。',
            userEntity:'',
            arr: [],
            user:'',
            token: '',
            roomID: '',
            game: '',
            toUser:'',
            createTime: '', //创建时间 or 结算时间
            recordEndTime: '', //创建游戏距离需要带的时间
            n_integral: -20,
            RecordList: '',
            otherInfo:'',
            otherName:'',
            otherToken:'',
            disableBtn:false,
            againText:'请等待'
        };
        this._load = this._load.bind(this);
        this._initWebSocket = this._initWebSocket.bind(this);
        this._getTime = this._getTime.bind(this);
        this._showUser = this._showUser.bind(this);
        this._getUser = this._getUser.bind(this);
    }
    //异步获取本人信息
    _getUser(){
        StorageUtil.getJsonObject('key').then(data=>{
            var value=JSON.parse(data);
            this.setState({
                user:value,
                token:JSON.stringify(value).Token
            });
        });
    }
    //进入加载
    componentDidMount() {
        this._getUser();
        this._getTime();
        this._initWebSocket();
        setTimeout(()=>{this._showUser()},2000);
    }
    //获取时间
    _getTime(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        var time = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        var t = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        this.setState({
            recordEndTime:t,
            createTime:time
        })
    }
    //通信
    _initWebSocket(){
        websock = new WebSocket('ws://172.16.31.250:8009/');
        websock.onopen = () => {
            let entity = {
                'FromUser':this.state.user.Token,
                'Tag': 'c'
            };
            websock.send(JSON.stringify(entity));
            //进入房间
            let c = {
                "FromUser": this.state.user.Token,
                "Tag": "i",
                "RoomID": this.state.roomID == '' ? "" : this.state.roomID
            };
            websock.send(JSON.stringify(c));
        };
        websock.onmessage = (e) => {
            // 接收到消息
            var data = JSON.parse(e.data);
            if(data.Tag=="r"){
                Toast.show("等待对手中。。。");
            }else if(data.Tag=="i"){
                this.setState({
                    roomID:data.RoomID,
                })
                //异步储存存
                StorageUtil.saveJsonObject('userInfo', data);
                //获取对手令牌
                for (var i = 0;i<data.ToUser.length;i++){
                    if(this.state.user.Token!=data.ToUser[i]){
                        this.setState({otherToken:data.ToUser[i]})
                        var user = {Token:this.state.otherToken}
                        var  user1 = JSON.stringify(user);
                        let user2 = {
                            'Message': user1,
                            'Tag': 'ac',
                            'ActionMethod': 'UserBLL.GetUserInfoByToken'
                        };
                        websock.send(JSON.stringify(user2))
                    }
                }
            }
            else if(data.ActionMethod == 'UserBLL.GetUserInfoByToken'){
                var res = JSON.parse(data.Message);
                // 判断加载对手是否为空
                if (res.Data!=null){
                    this.setState(
                        {
                            otherInfo:res.Data,
                            otherName:res.Data.AccountName
                        }
                    );
                }else {
                    this.setState(
                        {
                            otherInfo:res.Data,
                            otherName:this.state.againText,
                        }
                    );
                }
            }
            else if(data.Tag=="b"){
                this.setState({
                    toUser:data.toUser
                });
                var Record={
                    'AccountName':this.state.user.Token,
                    'Integral':this.state.n_integral,
                    'RoomID':this.state.roomID,
                    'GameID':1
                };
                var Record1=JSON.stringify(Record);
                let Precord={
                    'Message':Record1,
                    'Tag':'ac',
                    'ActionMethod':'RecordBLL.AddRecordToRedis'
                };
                websock.send(JSON.stringify(Precord));
            }
            else if(data.Tag=='ac'&&data.ActionMethod=='RecordBLL.AddRecordToRedis'){
                var data1=JSON.parse(data.Message);
                if(data1.Code==200){
                    var user1=JSON.stringify(data1);
                    Actions.play({'roomID':this.state.roomID,'myselfInfo':this.state.MySelfInfo});
                }
            }
            StorageUtil.saveJsonObject('game', JSON.stringify(data));
        };
        websock.onerror = (e) => {
            // 发生了一个错误
            console.log(e.message);
        };
        websock.onclose = (e) => {
            // 连接被关闭了
            console.log(e.code, e.reason);
        };

    }
    //准备游戏
    _load(){
        this.setState({disableBtn:true})
        StorageUtil.getJsonObject('game').then(data=>{
            var value= JSON.parse(data);
            this.setState({
                game:value
            })
        })
         var readyGame = {
            'FromUser': this.state.user.Token,
            'Tag': "r",
            'RoomID': this.state.roomID,
            'GameID':1
        };
        websock.send(JSON.stringify(readyGame));
    }
    //提示用户进入房间name
    _showUser(){
        StorageUtil.getJsonObject('game').then(data=>{
            var value=JSON.parse(data);
            this.setState({
                game:value
            });
            Toast.show("请准备。。")
        });
    };

    render() {
        const {navigation} = this.props
        return (
            <View style={styles.loadAll}>
                <View style={styles.loadImg}>
                    <Image source={require('../../img/load/ut2.png')} style={styles.userImg}/>
                </View>
                <View style={styles.loadWait}>
                    <Text style={styles.loadWaitText}>{this.state.waitText}</Text>
                </View>
                <View style={styles.loadUser}>
                    <View style={styles.loadUserCon}>
                        <View style={styles.userText}>
                            <Text>{this.state.user.AccountName}</Text>
                            <Text>{this.state.user.Integral}</Text>
                        </View>
                        <View style={styles.loadIcon}>
                            <Text style={styles.iconText}>{this.state.vsText}</Text>
                        </View>
                        <View style={styles.userText}>
                            <Text>{this.state.otherName}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.loadBtn} disabled={this.state.disableBtn}>
                    <Button color={'#5DBA9D'} onPress={this._load} disabled={this.state.disableBtn}  title={this.state.loadText}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loadBtn} >
                    <Button color={'#5DBA9D'} onPress={()=>{Actions.home()}} title={this.state.exitText}/>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    loadAll:{
        flex:1,
        backgroundColor:'#fff'
    },
    loadImg:{
        width:width,
        height:scaleSizeH(130),
        marginTop:scaleSizeH(130),
        alignItems:'center'
    },
    userImg:{
        width:scaleSizeW(130),
        height:scaleSizeH(130)

    },
    loadWait:{
        width:width,
        alignItems: 'center',
        marginTop: scaleSizeH(130)
    },
    loadWaitText:{
        fontSize:setSpText(35),
        color:'#000408',
    },
    loadUser:{
        width:width,
        height:scaleSizeH(250),
        justifyContent:'center',
        backgroundColor: '#5DBA9D',
        marginTop:scaleSizeH(100)
    },
    loadBtn:{
        marginTop:scaleSizeH(50),
    },
    loadUserCon:{
        flexDirection:'row',
        width:width,
        paddingLeft:scaleSizeW(165)
    },
    userText:{
        backgroundColor:'#FF7F50',
        borderRadius:20,
        width:scaleSizeW(130),
        height:scaleSizeH(130),
        alignItems:'center',
        justifyContent:'center'
    },
    iconText:{
        fontSize:setSpText(45),
        color:'#000408'
    },
    loadIcon:{
        width:scaleSizeW(130),
        height:scaleSizeH(130),
        alignItems: 'center',
        justifyContent: 'center'
    }
});
export default Load;
