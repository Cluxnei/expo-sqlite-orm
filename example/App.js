import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  const t1 = () => User.query().toSql()
  const t2 = () => User.query().select('id', 'name', 'age as idade').toSql()
  const t3 = () => User.query().selectRaw('id as x, name as y, age as z, sum(id) as amounOfId').toSql()
  const t4 = () => User.query().limit(10).toSql()
  const t5 = () => User.query().select('id', 'name', 'age as idade').limit(3).toSql()
  const t6 = () => User.query().select('id', 'name', 'age as idade').distinct('name').limit(3).toSql()
  const t7 = () => User.query().toSql()

  useEffect(() => {
    console.log(t1());
    console.log(t2());
    console.log(t3());
    console.log(t4());
    console.log(t5());
    console.log(t6());
    console.log(t7());
  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}