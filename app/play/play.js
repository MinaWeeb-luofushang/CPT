import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, Button, Dimensions, Image} from "react-native";
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";
import {scaleSizeH, scaleSizeW, setSpText}  from '../../utils/Screen';
import Toast from "react-native-root-toast";

const { width, height } = Dimensions.get('window');
var websock;
class Play extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id:'',
            Integral:200,
            textID:'ID：',
            TestList:[{id:1},{id:2}],
            textIg:'积分：',
            _timer:0,
            topicNext:'下一题',
            topicOver:'退出/结束',
            question:'题目：',
            answer:'答案：',
            topicNumber:0,
            Number:0,
            topicList:[],
            topics1:'加载中。。。',
            topicAnw1:'',
            inputAnw:'',
            disableNext:false,
            disableOver:true,
            user:'',
            getUserInput:[],
            b:false,
            name1:'',
            token:''
        };
        this._countTime = this._countTime.bind(this);
        this._nextClick = this._nextClick.bind(this);
        this._onChangeText = this._onChangeText.bind(this);
        this._getUser = this._getUser.bind(this);
        this._initWebsocket = this._initWebsocket.bind(this);
        this._overClick = this._overClick.bind(this);
        this._getOkNumber = this._getOkNumber.bind(this);
    }
    //进来就加载
    componentDidMount() {
        this._initWebsocket();
        this._countTime();
        this._getUser();
    }
    //异步获取本人信息
    _getUser(){
        StorageUtil.getJsonObject('key').then(data=>{
            var value=JSON.parse(data);
            //alert(JSON.stringify(value))
            this.setState({
                user:value,
                Id:value.ID,
                token:value.Token,
                Integral:value.Integral,
                name1:value.AccountName
            });
        });

    }
    //倒计时
    _countTime(){
        this._timer=setInterval(()=>{
            this.setState({
                _timer:this.state._timer+1
            })
            if(this.state._timer>=999){
                this._timer && clearInterval(this._timer);
                //alert("算了吧,您脑袋的水不够多")
            }},1000);
    }
    //清空倒计时
    componentWillUnmount() {
        this._timer && clearInterval(this._timer);
    }
    //下一题按钮事件
    _nextClick(){
            this.state.topicNumber++;
            this._getOkNumber();
            //获取对几题
            if(this.state.inputAnw == this.state.topicAnw1){
                this.setState({
                    Number:++this.state.Number
                })
            }
            //清空输入框
            this.setState({inputAnw:''})
            //判断在答题时间前刷完6题
            if(this.state.topicNumber>=this.state.topicList.length-1){
                //添加按钮禁用属性
                this.setState({
                    disableNext:true,
                    disableOver:false
                })
            }
    }
    //获取数组题目和答案
    _getOkNumber(){
        this.setState({
            topics1:this.state.topicList[this.state.topicNumber].Topic,
            topicAnw1:this.state.topicList[this.state.topicNumber].Answer
        });
        //添加答题到数组
        var id = this.state.topicList[this.state.topicNumber-1].ID;
        const strAnswer = {
            'AccountName':this.state.user.Token,
            "QuestionID": id,
            'Reply': this.state.inputAnw,
        }
        this.state.getUserInput.push(strAnswer)
        //获取对几题
        if(this.state.inputAnw == this.state.topicAnw1){
            this.setState({
                Number:++this.state.Number
            })
        }
        //清空输入框
        this.setState({inputAnw:''})
    }
    //获取输入的值，
    _onChangeText(text){
        this.state.inputAnw=text;
    }
    //通信
    _initWebsocket(){
        websock = new WebSocket('ws://172.16.31.250:8009/');
        //打开连接
        websock.onopen=()=>{
            //进入游戏页面就发送指令c
            const strAnswer = {
                "FromUser": this.state.user.Token,
                'Tag':'c'
            }
            websock.send(JSON.stringify(strAnswer));
            let getTopicList = {
                'Tag':'ac',
                ActionMethod:'QuestionBLL.GetQuestions'
            }
            websock.send(JSON.stringify(getTopicList));
        };
        //接收信息
        websock.onmessage=(e)=>{
            var data = JSON.parse(e.data);
            var strData =typeof data =='string'?JSON.parse(data):data;
            if (strData.ActionMethod == 'QuestionBLL.GetQuestions') {
                var data1 = JSON.parse(data.Message);
                if (data1.Code == 200) {
                    //把数据赋值给当前定义数组
                    this.setState({
                        topicList:data1.Data
                    })
                    //进来就加载第一题
                    this.setState({
                        topics1:this.state.topicList[this.state.topicNumber].Topic,
                        topicAnw1:this.state.topicList[this.state.topicNumber].Answer
                    });
                }
            }
            //答题完之后
            else if (strData.ActionMethod == "RecordQuestionBLL.IsRightToRedis" && this.state.b==true) {
                //alert("请等待");
                Actions.over({'id':this.state.Id,'number':this.state.Number,'integral':this.state.Integral,'RoomID':this.props.roomID,'token':this.state.user.Token,'name1':this.state.name1})
            }
            else if (strData.Tag == "vg") {
                Actions.over({'id':this.state.Id,'number':this.state.Number,'integral':this.state.Integral,'RoomID':this.props.roomID,'token':this.state.user.Token,'name1':this.state.name1})
            }
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
    //结束按钮
    _overClick(){
        this.setState({b:true})
        this.setState({
            topics1:this.state.topicList[this.state.topicNumber].Topic,
            topicAnw1:this.state.topicList[this.state.topicNumber].Answer
        });
        //添加答题到数组
        var id = this.state.topicList[this.state.topicNumber].ID;
        const strAnswer = {
            'AccountName':this.state.user.Token,
            "QuestionID": id,
            'Reply': this.state.inputAnw,
        }
        this.state.getUserInput.push(strAnswer)

        //将答题返回服务
        const action1 = {
            "FromUser":this.state.user.Token,
            "RoomID":this.props.roomID,
            "Tag": "gv"
        }
        websock.send(JSON.stringify(action1));

        var arry = {'dtos':this.state.getUserInput}
        const record = JSON.stringify(arry);
        const action ={
            "Message":record,
            "Tag": "ac",
            "ActionMethod": "RecordQuestionBLL.IsRightToRedis"
        }
        websock.send(JSON.stringify(action));
        this.setState({
            disableOver:true,
            topicOver:'等待中。。。'
        })
        //清空输入框
        this.setState({inputAnw:''})
    }

    render() {
        return (
            <View style={styles.playAll}>
                <Text style={styles.homeExit} onPress={()=>{Actions.home()}}>
                    <Image source={require('../../img/home/tuichu.png')} style={styles.imgExit}/>
                </Text>
                <View style={styles.playHeader}>
                    <Text style={styles.headerTextID}>{this.state.textID} {this.state.Id}</Text>
                    <Text style={styles.headerTextIG}>{this.state.textIg} {this.state.Integral}</Text>
                </View>
                <View style={styles.playTopic}>
                    <Text style={styles.playTime}>{this.state._timer}</Text>
                    <View multiline style={styles.playTopicCot} >
                        <Text>{this.state.topicNumber+1}/{this.state.topicList.length}</Text>
                        <Text>{this.state.question}{this.state.topics1}</Text>
                    </View>
                    <TextInput
                        style={styles.playTopicAwn}
                        placeholder={this.state.answer}
                        onChangeText={this._onChangeText}
                        value={this.state.inputAnw}
                        maxLength={15}
                        onChangeText={(text) => {this.setState({inputAnw:text})}}
                    ></TextInput>


                    <TouchableOpacity style={styles.topicBtn}   disabled={this.state.disableNext}>
                        <Button style={styles.btnText} onPress={this._nextClick} disabled={this.state.disableNext} title={this.state.topicNext}></Button>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.topicBtn}
                        disabled={this.state.disableOver}>
                        <Button style={styles.btnText} onPress={this._overClick} disabled={this.state.disableOver} title={this.state.topicOver}></Button>
                    </TouchableOpacity>
                </View>
                <View style={styles.playFood}>

                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    playAll:{
        flex:1,
        backgroundColor:'#119EDA',
    },
    playHeader:{
        flex:1,
        backgroundColor: '#119EDA',
        flexDirection:'row',
        padding:14
    },
    headerTextID:{
        color:'#FFF',
        fontSize:18,
        textAlign:'left',
        flex:1
    },
    headerTextIG:{
        color:'#FFF',
        fontSize:18,
        flex:1,
        textAlign:'right',
    },
    playTopic:{
        flex:7,
        backgroundColor: '#F9CD4F',
        alignItems:'center',
        fontSize:23,
        color:'#FFF',
        padding: 10
    },
    playTime:{
        width:'100%',
        height:30,
        backgroundColor:'#FE5161',
        fontSize: 20,
        color: '#FFF',
        textAlign: 'center'
    },
    playTopicCot:{
        paddingLeft:16,
        width: '100%',
        height: 150,
        backgroundColor:'#FEFEFF',
        color:'#686868',
        fontSize:18,

    },
    playTopicAwn:{
        borderTopWidth:1,
        borderColor:'#ccc',
        width: '100%',
        height: 60,
        backgroundColor:'#FEFEFF',
        textAlign:'center'
    },
    playFood:{
        flex:2,
        backgroundColor: '#F9CD4F',
    },
    topicBtn:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',

    },
    btnText:{
        width:width,
        height:32,
        backgroundColor:'#66BAA0',
        textAlign: 'center',
        borderRadius:5,
        color:'#FFF'
    },
    homeExit:{
        padding:12,
        right:'-85%'
    },
    imgExit:{
        width:30,
        height:30
    },
});
export default Play;