import cv2
import numpy as np

max_dist = 10
def closePoints(pt1, pt2, dist):
	x1, y1 = pt1
	x2, y2 = pt2
	dx = abs(x1 - x2)
	dy = abs(y1 - y2)
	return(((dx < dist) and (dy < dist)) and (dx != 0 or dy != 0))

def closeLines(l1, l2, dist):
	x11, y11, x12, y12 = l1
	x21, y21, x22, y22 = l2
	pt11 = [x11, y11]
	pt12 = [x12, y12]
	pt21 = [x21, y21]
	pt22 = [x22, y22]
	return ((closePoints(pt11, pt21, dist) and closePoints(pt12, pt22, dist)))

def averageLines(l1, l2):
	x11, y11, x12, y12 = l1
	x21, y21, x22, y22 = l2
	xa1 = int((x11 + x21)/2)
	xa2 = int((x12 + x22)/2)
	ya1 = int((y11 + y21)/2)
	ya2 = int((y12 + y22)/2)
	la = [xa1, ya1, xa2, ya2]
	return la

def processImage(img):
	#set to grayscale
	grayscale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

	#blur the image
	blur = cv2.GaussianBlur(grayscale,(5, 5),0)

	#set threshold
	ret, thresh = cv2.threshold(blur, 120, 255, cv2.THRESH_BINARY)
	canny = cv2.Canny(thresh, 100, 150)

	return canny

def drawLines(lines, img):
	try:
		for line in lines:
			for x1, y1, x2, y2 in line:
				if((abs(x1 - x2) < max_dist) and (abs(y1 - y2) >= max_dist)):
					x2 = x1
					cv2.line(img,(x1,y1),(x2,y2),(0,0,255),1)
				if((abs(x1 - x2) >= max_dist) and (abs(y1 - y2) < max_dist)):
					y2 = y1
					cv2.line(img,(x1,y1),(x2,y2),(0,0,255),1)
	except:
		pass
	return img

def removeDoubleLines(lines):
	linesTemp = np.copy(lines)
	try:
		size = lines.shape[0]
		for i in range(size-1, -1, -1):
			for j in range(i, -1, -1):
				if(closeLines(lines[i][0], lines[j][0], max_dist)):
					linesTemp[j][0] = averageLines(lines[i][0], lines[j][0])
					linesTemp = np.delete(linesTemp, i, 0)
					break
	except:
		pass
	return linesTemp



def getLines(inImg):
	lines = cv2.HoughLinesP(inImg,1,np.pi/180, 50, np.array([[]]), 10, 20)
	linesTemp = removeDoubleLines(lines)
	newLines = []
	try:
		for line in linesTemp:
			for x1, y1, x2, y2 in line:
				newLines.append([[int(x1),int(y1)], [int(x2),int(y2)]])
	except:
		pass
	return newLines, linesTemp