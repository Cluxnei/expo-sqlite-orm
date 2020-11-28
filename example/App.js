import React, { useEffect } from 'react';
import Model from './src/models/Model'
import { View, Text } from 'react-native'

export default function App() {
  useEffect(() => {
    const sql = new Model({
      name: 'Kelvin',
      active: true,
      weight: 123.67,
      age: 20,
    }) //.query().select('id').toSql()

    console.log(sql.query().select('id', 'name').toSql())
  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}