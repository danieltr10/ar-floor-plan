import cv2
import mss
import numpy as np
import time

with mss.mss() as sct:
	monitor = {"top": 95, "left": 65, "width": 550, "height": 400}
	last_time = 0
	while "Screen capturing":
		#print fps
		fps = int(1/(time.time() - last_time))
		# print('{} fps'.format(fps))
		last_time = time.time()

		#read image
		img = np.array(sct.grab(monitor))

		#set to grayscale
		grayscale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

		#blur the image
		blur = cv2.GaussianBlur(grayscale,(5, 5),0)

		#set threshold
		ret, thresh = cv2.threshold(blur, 100, 255, cv2.THRESH_BINARY)

		canny = cv2.Canny(thresh, 50, 150)

		inv = cv2.bitwise_not(canny)

		# img2, contours, hierarchy = cv2.findContours(inv, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
		# cv2.drawContours(img, contours, -1, (255, 0, 0), 1)

		lines = cv2.HoughLinesP(canny,1,np.pi/180, 50, np.array([]), 20, 20)

		max_dist = 20
		lines_temp = lines

		try:
			for line1 in lines:
				for line2 in lines:
					if closeLines(line1, line2, max_dist):
						print(line2)
						np.delete(lines, line2)
		except:
			pass

		try:
			for line in lines:
				for x1, y1, x2, y2 in line:
					if((abs(x1 - x2) < max_dist) & (abs(y1 - y2) >= max_dist)):
						x2 = x1
						cv2.line(img,(x1,y1),(x2,y2),(0,0,255),1)
					if((abs(x1 - x2) >= max_dist) & (abs(y1 - y2) < max_dist)):
						y2 = y1
						cv2.line(img,(x1,y1),(x2,y1),(0,0,255),1)
		except:
			pass

		def closePoints(pt1, pt2, dist):
			x1, y1 = pt1
			x2, y2 = pt2
			dx = abs(x1 - x2)
			dy = abs(y1 - y2)
			print(dx+" "+dy)
			return(((dx < dist) & dx != 0) & ((dy < dist) & dy != 0))

		def closeLines(l1, l2, dist):
			pt11, pt12 = l1
			pt21, pt22 = l2
			return (closePoints(pt11, pt21, dist) & closePoints(pt12, pt22, dist))



		# cv2.imshow('thresh', thresh)
		# cv2.imshow('blur', blur)
		cv2.imshow('img', img)

		if cv2.waitKey(25) & 0xFF == ord("q"):
			cv2.destroyAllWindows()
			break
