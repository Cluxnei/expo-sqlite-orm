import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  useEffect(() => {
      (async () => {
          await User.createTable()
          await User.query().get()
          console.clear()
          const a = User.query()
              .where('name', '=', 'kelvin')
              .orWhere('age', '>', 10)
              .orWhere((q) => q.where('active', '=', true).where('role_id', '=', 3).where((q) => q.where('age', '!=', 3).orWhere('age', 'is', 'odd')))
          a.buildQuery()
          console.log(a)
      })()

  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}