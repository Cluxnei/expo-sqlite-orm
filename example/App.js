import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  const t1 = () =>
      User.query()
      .where((query) => {
        query.where('name', 'like', '%you%')
            .orWhere('age', '=', 3)
      })
      .orWhere('active', '=', false)
      .toSql()

  useEffect(() => {
    console.log(t1());
  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}