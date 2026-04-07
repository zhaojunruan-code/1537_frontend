/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { WriteEssay } from './pages/WriteEssay';
import { GradeEssay } from './pages/GradeEssay';
import { Recharge } from './pages/Recharge';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { RecordDetail } from './pages/RecordDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="login" element={<Login />} />
          <Route path="write" element={<RequireAuth><WriteEssay /></RequireAuth>} />
          <Route path="grade" element={<RequireAuth><GradeEssay /></RequireAuth>} />
          <Route path="recharge" element={<RequireAuth><Recharge /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="record/:id" element={<RequireAuth><RecordDetail /></RequireAuth>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
