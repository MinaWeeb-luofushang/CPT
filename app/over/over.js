import React, {Component} from 'react';
import {StyleSheet, View, FlatList, Text, TouchableOpacity} from "react-native";
import {Actions} from "react-native-router-flux";
import StorageUtil from "../../utils/StorageUtil";
import Toast from "react-native-root-toast";


var websock;
class Over extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [
                {key:0,name:this.props.name1,UserIgl:this.props.number*10 ,soIg:this.props.integral+this.props.number*10}
            ],
            tableId:'玩家',
            tableIg:'积分',
            tableRt:'结果',
            tableSm:'结算',
            exit:'返回大厅',
            user:'',
            roomId:'',
            token:'',
            okTxt:'答对了',
            getList:[],
            name1:'',
            userIG1:'',
            userNumber1:0,

            name2:'',
            userIG2:'',
            userNumber2:0
        };
        this._initWebsocket = this._initWebsocket.bind(this);
        this._getUser = this._getUser.bind(this);
        this._getData = this._getData.bind(this);
    }
    //异步获取本人信息
    _getUser() {
        StorageUtil.getJsonObject('key').then(data => {
            var value = JSON.parse(data);
            this.setState({
                user: value,
                userIG:value.Integral
            });
        });
    }
    //通信
    _initWebsocket(){
        websock = new WebSocket('ws://172.16.31.250:8009/');
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
                    this.setState({getList: data1.Data})
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
            this._getData();
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
    //循环视图
    _renderItem=({item})=>{
        return(
            <View style={styles.Ranking}>
                {/*<Text style={styles.tableText}>{item.name}</Text>*/}
                {/*<Text style={styles.tableText}>{this.props.integral}</Text>*/}
                {/*<Text style={styles.tableText}>{item.soIg}</Text>*/}
                {/*<Text style={styles.tableText}>+{item.UserIgl}</Text>*/}
            </View>
            )
    }
    _keyExtractor=(item,index)=>{
        return item.key.toString();
    }
    _Separator=()=>{
        return(
            <View style={{height:1,width:'100%',backgroundColor:'#F4F4F4'}}></View>
        );
    }
    _getData(){
        if(this.state.getList[1]!=null){
            this.setState({
                name1:this.state.getList[0].AccountName,
                userIG1:this.state.userIG+this.state.getList[0].Sum-20,
                userNumber1:this.state.getList[0].RightCount,

                name2:this.state.getList[1].AccountName,
                userIG2:this.state.userIG+this.state.getList[1].Sum-20,
                userNumber2:this.state.getList[1].RightCount
            })
        }else{
            Toast.show("对手比你菜！SO 请刷新")
        }

    }
    render() {
        return (
            <View style={styles.overAll}>
                <View style={styles.overCtn}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableText}>{this.state.tableId}</Text>
                        <Text style={styles.tableText}>{this.state.tableIg}</Text>
                        <Text style={styles.tableText}>{this.state.tableRt}</Text>
                        <Text style={styles.tableText}>{this.state.tableSm}</Text>
                    </View>

                    <View style={styles.Ranking}>
                        <Text style={styles.tableText}>{this.state.name1}</Text>
                        <Text style={styles.tableText}>-12138</Text>
                        <Text style={styles.tableText}>{this.state.okTxt}{this.state.userNumber1}</Text>
                        <Text style={styles.tableText}>{this.state.userIG1}</Text>
                    </View>
                    <View style={styles.Ranking}>
                        <Text style={styles.tableText}>{this.state.name2}</Text>
                        <Text style={styles.tableText}>{this.state.userIG}</Text>
                        <Text style={styles.tableText}>{this.state.okTxt}{this.state.userNumber2}</Text>
                        <Text style={styles.tableText}>{this.state.userIG2}</Text>
                    </View>



                    <FlatList
                        renderItem={this._renderItem}
                        ItemSeparatorComponent={this._Separator}
                        keyExtractor={this._keyExtractor}
                        data={this.state.dataList}
                        showsVerticalScrollIndicator={false}
                    />
                    <TouchableOpacity
                        style={styles.topicBtn}
                        onPress={()=>{Actions.home({'userIG':this.state.userIG-100})}}
                    >
                        <Text style={styles.btnText}>{this.state.exit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topicBtn}
                        onPress={this._initWebsocket}
                    >
                        <Text style={styles.btnText}>刷新</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    overAll:{
        flex:1,
        backgroundColor:'#9369F6',
        alignItems:'center',
        justifyContent:'center',
    },
    overCtn:{
        width:'90%',
        height:'70%',
        backgroundColor: '#F3C9FF'
    },
    tableHeader:{
        width:'100%',
        height:'10%',
        backgroundColor:'#CCCCCC',
        flexDirection:'row',
        alignItems: 'center',
        paddingLeft:20
    },
    tableText:{
        flex:1,
        color:'#FFF'
    },
    Ranking:{
        width:'100%',
        paddingLeft: 20,
        alignItems:'center',
        flexDirection:'row',
    },
    topicBtn:{
        alignItems:'center',
        justifyContent:'center',
        marginBottom:'20%'
    },
    btnText:{
        width:250,
        height:32,
        backgroundColor:'#66BAA0',
        textAlign: 'center',
        borderRadius:5,
        color:'#FFF',

    },
});
export default Over;