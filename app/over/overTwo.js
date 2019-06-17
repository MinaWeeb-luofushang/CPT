import React, {Component} from 'react';
import {View, Text, Button, StyleSheet} from "react-native";
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";
import Toast from "react-native-root-toast";

var websock;
class OverTwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            getList:[],
            name:''
        };
        this._initWebsocket = this._initWebsocket.bind(this);
        this._getUser = this._getUser.bind(this);
        this._onClick = this._onClick.bind(this);
    }
    //异步获取本人信息
    _getUser() {
        StorageUtil.getJsonObject('key').then(data => {
            var value = JSON.parse(data);
            this.setState({
                user: value
            });
        });
    }
    //通信
    _initWebsocket(){
        websock = new WebSocket('ws://172.16.31.236:8009/');
        websock.onopen=()=>{
            const  roomid = {
                'RoomID':this.state.roomId
            };
            const  jsogRoomid = JSON.stringify(roomid);
            let entity = {
                'Message':jsogRoomid,
                'Tag':'ac',
                'ActionMethod':'RecordBLL.GetRecordRightCount'
            }
            websock.send(JSON.stringify(entity))
        }
        websock.onmessage=(e)=>{
            var data = JSON.parse(e.data);
            var strData = typeof data == 'string' ? JSON.parse(data) : data;
            if (strData.ActionMethod == 'RecordBLL.GetRecordRightCount') {
                var data1 = JSON.parse(strData.Message);
                if (data1.Code==200){
                    Toast.show(JSON.stringify(data1.Data))
                    this.setState({getList:data1.Data})
                    const user = {
                        'Token':this.props.token
                    }
                    const user1 = JSON.stringify(user);
                    const user2 = {
                        "Message": user1,
                        "Tag": "ac",
                        "ActionMethod": "UserBLL.GetUserInfoByToken"
                    };
                    websock.send(JSON.stringify(user2))
                }
            }
            else if(strData.ActionMethod == 'UserBLL.GetUserInfoByToken'){
                var res = JSON.parse(strData.Message)
                this.setState({data:res})
            }
        }
        websock.close=(e)=> {
            //关闭
        },
            websock.onerror=()=> {
                //连接建立失败重连
                //this.initWebSocket();
            }

    }
    //进来就加载
    componentDidMount() {
        this.setState({
            roomId:this.props.RoomID,
            token:this.props.token
        })
        this._getUser();
        this._initWebsocket();

    }
    _onClick(){

        this.setState({
            name:JSON.stringify(this.state.getList[0].AccountName)
        })
    }
    render() {
        return (
            <View>
                <Button title={'点击'} onPress={this._onClick}/>
                <View style={styles.Ranking}>
                    <Text style={styles.tableText}>{this.state.name}</Text>
                    {/*<Text style={styles.tableText}>{this.props.integral}</Text>*/}
                    {/*<Text style={styles.tableText}>{JSON.stringify(this.state.getList[0].Sum)}</Text>*/}
                    {/*<Text style={styles.tableText}>{this.props.integral+JSON.stringify(this.state.getList[0].Sum)}</Text>*/}
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    Ranking:{
        width:'100%',
        paddingLeft: 20,
        alignItems:'center',
        flexDirection:'row',
    },
    tableText:{
        flex:1,
        color:'#CCC'
    },
})
export default OverTwo;