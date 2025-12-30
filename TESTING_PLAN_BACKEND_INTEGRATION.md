# Testing & Debugging Plan - VisFlow-Lite Backend Integration

**Date Created:** 2025-12-30  
**Status:** Ready for Testing  
**Integration Completed:** 7/7 Tasks ✅

---

## 🎯 Overview

Full integration between VisFlow-Lite (Vue 3 frontend) and VisTrailsJL (Julia backend) is complete. This plan guides testing and debugging of the incremental workflow editing system.

### What's Been Implemented

1. ✅ **API Service Layer** - Complete backend communication
2. ✅ **Type Definitions** - BackendModule interface and tracking fields  
3. ✅ **State Management** - Module loading and workflow management
4. ✅ **New Workflow Button** - AppHeader with workflow creation
5. ✅ **Module Display** - NodePanel shows backend modules grouped by package
6. ✅ **Node Creation** - Creates backend modules via API
7. ✅ **Edge Creation** - Creates backend connections via API

---

## 📋 Phase 1: Verify System Status (5-10 minutes)

### 1.1 Check Running Processes

**Problem:** Currently have 17+ Julia backend processes running - need to clean up!

```bash
# Check how many Julia processes are running
lsof -ti:8000 | wc -l

# If more than 1, kill all and restart
pkill -f "julia.*http_server.jl"
sleep 2

# Start fresh backend
cd /Users/csilva/github-ctsilva/VisTrailsJL/julia/backend
PORT=8000 julia --project=. http_server.jl
```

**Expected:**
- Only 1 Julia process on port 8000
- Server starts and shows: "Listening on: 0.0.0.0:8000"

### 1.2 Verify Frontend

```bash
# Check if frontend is running
lsof -ti:5174

# If not running, start it
cd /Users/csilva/github-ctsilva/VisFlow-Lite/visflow-lite
npm run dev
```

**Expected:**
- Vite dev server running on localhost:5174
- No compilation errors
- HMR (Hot Module Replacement) enabled

### 1.3 Quick Health Check

**Backend Test:**
```bash
curl http://localhost:8000/api/modules | head -c 500
```

**Expected Output:**
```json
{"modules":[{"name":"Boolean","input_ports":[],"package":"org.vistrails.vistrails.basic"...
```

**Frontend Test:**
- Open http://localhost:5174 in browser
- Open browser DevTools Console (F12)
- Check for errors (there should be none)

**✅ Phase 1 Complete When:**
- [ ] Only 1 backend process running
- [ ] Frontend running without errors
- [ ] Backend responds to `/api/modules`

---

## 🧪 Phase 2: Frontend UI Testing (15-20 minutes)

### 2.1 Module Loading Test

**Steps:**
1. Open http://localhost:5174
2. Look at left sidebar (NodePanel)

**Expected Results:**
- [ ] NodePanel appears on left side
- [ ] Shows "Loading modules..." briefly
- [ ] Modules appear grouped by package:
  - **Basic** (13 modules): Boolean, Float, HTTPFile, Integer, List, etc.
  - **Control_Flow** (9 modules): And, Cross, Dot, ElementwiseProduct, If, Not, Or, Sum, While
  - **Julia** (1 module): JuliaSource
  - **Matplotlib** (6 modules): MplBar, MplFigure, MplFigureOutput, MplHist, MplLinePlot, MplScatter
  - **Pythoncalc** (1 module): PythonCalc

**Debug if fails:**
- Check browser console for errors
- Verify `GET http://localhost:8000/api/modules` succeeds
- Check NodePanel.ts:32-40 for loading logic

### 2.2 Workflow Creation Test

**Steps:**
1. Click "New Workflow" button in header (top left)
2. Watch browser console
3. Check header for workflow name

**Expected Results:**
- [ ] Button click triggers API call
- [ ] Console shows: `Created new workflow: workflow_YYYYMMDD_HHMMSS (ID: ...)`
- [ ] Header displays workflow name with icon
- [ ] Canvas clears (if there were any nodes)

**Debug if fails:**
- Check browser console for error messages
- Verify backend logs show workflow creation
- Check AppHeader.ts:6-19

### 2.3 Module Drag & Drop Test

**Steps:**
1. Find "Integer" module in the Basic group
2. Click and drag it onto the canvas
3. Release mouse

**Expected Results:**
- [ ] Module appears on canvas at drop position
- [ ] Module shows:
  - Label: "Integer"
  - 1 output port (right side) labeled "value"
  - No input ports
- [ ] Console shows: `Created backend module:` with module details
- [ ] Module ID format: `node-{number}` (e.g., `node-1`)
- [ ] Backend logs show: Module creation with type `org.vistrails.vistrails.basic::Integer`

**Debug if fails:**
- **Module doesn't appear:** Check DataflowCanvas.ts:359-399
- **No ports visible:** Check index.ts:121-129 - port mapping from backend
- **API error:** Check backend logs for error messages

### 2.4 Multiple Modules Test

**Steps:**
1. Drag "PythonCalc" module from Pythoncalc group onto canvas
2. Position it to the right of the Integer module
3. Try dragging modules around

**Expected Results:**
- [ ] Both modules visible on canvas
- [ ] PythonCalc shows:
  - Label: "PythonCalc"
  - 2 input ports: "value1", "value2"
  - 1 output port: "value"
- [ ] Modules can be dragged to new positions
- [ ] Module IDs: `node-1`, `node-2`

### 2.5 Connection Creation Test

**Steps:**
1. Find the Integer module's output port (right side, labeled "value")
2. Click and drag from the output port
3. Move cursor to PythonCalc's first input port ("value1")
4. Release mouse

**Expected Results:**
- [ ] While dragging: See edge preview line following cursor
- [ ] On release: Edge appears connecting the two ports
- [ ] Console shows: `Created edge:` with edge details
- [ ] Edge has Bezier curve shape
- [ ] Backend logs show: Connection creation with IDs

**✅ Phase 2 Complete When:**
- [ ] All 5 tests pass
- [ ] No console errors
- [ ] Backend logs show all operations

---

## 🔧 Phase 3: Known Issues & Debugging (30-45 minutes)

### 3.1 Port Visibility Issue

**Symptom:** Modules appear but ports are not visible

**Debug Steps:**
1. Open browser DevTools
2. Select a module on canvas
3. Check console: `console.log(dataflowStore.nodes)`
4. Verify node has `inputs` and `outputs` arrays populated

**Fix Location:** index.ts:121-129

### 3.2 CORS Issues

**Symptom:** Browser console shows CORS errors

**Example Error:**
```
Access to fetch at 'http://localhost:8000/api/modules' from origin 'http://localhost:5174'
has been blocked by CORS policy
```

**Fix:** Add CORS headers to backend (http_server.jl)

### 3.3 Module Icons Not Displaying

**Symptom:** Module list shows squares instead of emojis

**Alternative:** Replace emojis with Bootstrap icons in NodeList.vue

### 3.4 Edge Rendering Issues

**Symptom:** Edges don't connect to ports correctly

**Debug:**
- Check port coordinates in Port.ts
- Verify edge path calculation in Edge.ts

### 3.5 History Panel Conflicts

**Symptom:** Undo/Redo doesn't work with backend operations

**Temporary Fix:** Disable history for backend workflows

---

## ✅ Phase 4: Backend Validation (15-20 minutes)

### 4.1 Verify Workflow State

**Objective:** Confirm backend maintains correct state

### 4.2 Test Module Parameters

**Test with curl:**
```bash
WORKFLOW_ID="workflow_20251230_HHMMSS"

curl -X POST "http://localhost:8000/api/workflow/${WORKFLOW_ID}/module" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "org.vistrails.vistrails.basic::Integer",
    "position": {"x": 100, "y": 100},
    "parameters": {"value": "42"}
  }'
```

### 4.3 Test Error Handling

Test with invalid module types and connections

---

## 🚀 Phase 5: Enhancements (If time permits)

### 5.1 Add Workflow Name Input
### 5.2 Module Properties Panel
### 5.3 Better Error Messages
### 5.4 Visual Feedback

---

## 🧹 Phase 6: Code Cleanup

### 6.1 Kill Duplicate Backend Processes
### 6.2 Update CLAUDE.md
### 6.3 Git Commit

---

## 📝 Testing Checklist

### Frontend Launch
- [ ] Frontend running on localhost:5174
- [ ] No console errors on page load
- [ ] NodePanel visible with modules grouped

### Backend Verification
- [ ] Backend running on localhost:8000
- [ ] GET /api/modules returns 30 modules
- [ ] Modules grouped into 5 packages

### Basic Workflow
- [ ] Click "New Workflow" creates workflow
- [ ] Workflow name appears in header
- [ ] Console shows successful API call

### Module Creation
- [ ] Drag Integer module - appears correctly
- [ ] Module has correct ports
- [ ] Backend logs show creation
- [ ] Module ID: node-{number}

### Module Connection
- [ ] Drag from output to input port
- [ ] Edge preview shows during drag
- [ ] Edge created on drop
- [ ] Backend logs show connection

### Advanced Tests
- [ ] Multiple modules
- [ ] Multiple connections
- [ ] Move nodes (edges follow)
- [ ] Delete edges
- [ ] Undo/Redo works

---

## 🚨 Emergency Fallback

### Revert to Working State
- All changes tracked in git
- Can selectively revert components

### Isolate Problems
- Test backend independently
- Test frontend with mock data
- Identify layer causing issue

### Document Issues
- Screenshot errors
- Copy console logs
- Note reproduction steps

---

## 📞 Quick Reference

### URLs
- Frontend: http://localhost:5174
- Backend: http://localhost:8000/api/modules

### Commands
```bash
# Kill backend processes
pkill -f "julia.*http_server.jl"

# Start backend
cd /Users/csilva/github-ctsilva/VisTrailsJL/julia/backend
PORT=8000 julia --project=. http_server.jl

# Start frontend
cd /Users/csilva/github-ctsilva/VisFlow-Lite/visflow-lite
npm run dev

# Test backend
curl http://localhost:8000/api/modules | head -c 500
```

---

**Good luck with testing! 🚀**
