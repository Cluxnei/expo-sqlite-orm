import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  useEffect(() => {
      (async () => {
          console.log(await User.createTable())
          console.log(await User.query().get())
          const a = User.query()
              .where('name', '=', 'kelvin')
              .orWhere('age', '>', 10)
              .orWhere((q) => q.where('active', '=', true).where('role_id', '=', 3))
          a.buildQuery()
          console.log(a.toSql(), a)
      })()

  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}