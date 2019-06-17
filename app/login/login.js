import React, {Component} from 'react';
import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";

//全局通信变量
var websock;
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            titleText:'Welcome back',
            tipsId:'账号·手机号·用户名·邮箱',
            tipsPwd:'密码   请输入登录密码',
            loginBtn:'登录',
            forgetPwd:'忘记密码',
            otherLogin:'第三方登录',
            register:'没有账户， 注册！',
            userName:'',
            userPwd:'',
            token: '',
            timeLeft:60,
            begin:0,
            isDisable:false
        };
        this._onChangeName = this._onChangeName.bind(this);
        this._onChangePwd = this._onChangePwd.bind(this);
        this._login = this._login.bind(this);
        this._judge = this._judge.bind(this);
        this._click = this._click.bind(this);
    }
    //进入加载
    componentDidMount() {
        this._judge();
    }
    //判断是否为二次登录
    _judge(){
        StorageUtil.getJsonObject('key').then(data=>{
            if(data!=null){
                Actions.home();
            }
        })

    }
    //debug登录测试
    _click(){
        this.setState({
            userName:'kkk',
            userPwd:'123'
        })
    }
    //获取输入账号
    _onChangeName(inputData){
        this.setState({
            userName:inputData
        })
    }
    //获取输入密码
    _onChangePwd(inputData){
        this.setState({
            userPwd:inputData
        })
    }
    //登录
    _login(){
       websock = new WebSocket('ws://172.16.31.250:8009/');
       websock.onopen=()=>{
           var user = {
               'AccountName':this.state.userName,
               'UserPassWord': this.state.userPwd
           };
           var userLogin = JSON.stringify(user);
           let actions = {
               "Message": userLogin,
               "Tag": "ac",
               'ActionMethod': 'UserBLL.Login',
           }
           websock.send(JSON.stringify(actions));
       };
        websock.onmessage=(e)=>{
            // 接收到了一个消息
            var data = JSON.parse(e.data);
            var res = JSON.parse(data.Message);
            var user1=JSON.stringify(res.Data);
            //保存用户信息
            StorageUtil.saveJsonObject('key', user1);
            if (res.Data != null) {
                Actions.home();
            } else {
                alert('请检查账号密码是否正确！')
            }
        }
        websock.onerror=(e)=>{

        }
        websock.onclose=(e)=>{
            alert("您连接的网络！不行呀！");
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.loginTitle}>
                    <Text style={styles.loginTitleText} onPress={this._click}>
                        {this.state.titleText}

                    </Text>
                </View>
                <View style={styles.loginCont}>
                    <TextInput style={styles.loginInput} placeholder={this.state.tipsId} maxLength={13} onChangeText={this._onChangeName} value={this.state.userName}></TextInput>
                    <TextInput style={styles.loginInput} placeholder={this.state.tipsPwd} secureTextEntry   maxLength={10} onChangeText={this._onChangePwd} value={this.state.userPwd}></TextInput>

                    <TouchableOpacity style={styles.loginBtn}>
                        <Text style={styles.btnText}  onPress={this._login}>{this.state.loginBtn}</Text>
                    </TouchableOpacity>
                    <View style={styles.forgetPwd}>
                        <Text style={styles.forgetPwdText}>{this.state.forgetPwd}</Text>
                    </View>
                </View>
                <View style={styles.foodContent}>
                    <View style={styles.otherLogin}>
                        <Text style={styles.ortheryixian}></Text>
                        <Text style={styles.ortherText}>{this.state.otherLogin}</Text>
                        <Text style={styles.ortheryixian}></Text>
                    </View>
                    <View style={styles.otherImg}>
                        <Image source={require('../../img/qq.png')} style={styles.maxImg}></Image>
                        <Image source={require('../../img/weixin.png')} style={styles.maxImg}></Image>
                        <Image source={require('../../img/xinlang.png')} style={styles.maxImg}></Image>
                    </View>
                    <View style={styles.registers}>
                        <Text style={styles.forgetPwdText}>{this.state.register}</Text>
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6E6',
        alignItems:'center',
        justifyContent:'center'
    },
    loginTitle:{
        backgroundColor:'#66BAA0',
        width: '100%',
        height: '29%',
        alignItems:'center',
        justifyContent:'center'
    },
    loginTitleText:{
        fontSize: 30,
        color:'#FFF'
    },
    loginCont:{
        width:'85%',
        height:'35%',
        backgroundColor: '#FFF',
        margin:'7%',
        borderRadius:10,
        alignItems:'center',
        justifyContent:'center',
        borderTopWidth:2,
        borderBottomWidth:2,
        borderLeftWidth:2,
        borderRightWidth:2,
        borderColor: "#BFBFC0",
        paddingTop:10
    },
    loginInput:{
        flex:1,
        width:'90%',
        borderBottomWidth:2,
        borderColor:'#CCC',
    },
    loginBtn:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        paddingTop:32
    },
    btnText:{
        width:250,
        height:32,
        backgroundColor:'#66BAA0',
        textAlign: 'center',
        paddingTop: 6,
        borderRadius:5,
        color:'#FFF'
    },
    forgetPwd:{
        flex:1,
        flexDirection:'row',
        marginTop:'8%'
        // alignItems:'center',
        //justifyContent:'center',
    },
    forgetPwdText:{
        fontSize:13,
        color:'#7F7F80',
    },
    foodContent:{
        flex:1
    },
    otherLogin:{
        flexDirection: 'row',
        width:'90%'
    },
    ortheryixian:{
        width:'30%',
        height:2,
        backgroundColor:'#CCC'
    },
    ortherText:{
        margin:13,
        fontSize:13,
        color:'#7F7F80',
        marginTop: -11
    },
    otherImg:{
        flexDirection:'row',

    },
    maxImg:{
        marginTop:8,
        marginLeft:40,
        width:50,
        height:50
    },
    registers:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    }
});
export default Login;