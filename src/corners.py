import cv2
import mss
import numpy as np
import time

with mss.mss() as sct:
	monitor = {"top": 95, "left": 65, "width": 480, "height": 270}
	last_time = 0
	while "Screen capturing":
		#print fps
		fps = int(1/(time.time() - last_time))
		print('{} fps'.format(fps))
		last_time = time.time()

		#read image
		# img = np.array(sct.grab(monitor))
		img = cv2.imread('imgs/planta.jpg')
		#set to grayscale
		grayscaled = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

		ret, thresh = cv2.threshold(grayscaled, 100, 255, cv2.THRESH_BINARY)

		canny = cv2.Canny(thresh, 50, 150)

		corner = np.float32(canny)
		dst = cv2.cornerHarris(grayscaled, 2, 3, 0.04)

		dst = cv2.dilate(dst, None)

		img[dst > .1*dst.max()] = [0, 0, 255]
		img[dst > .2*dst.max()] = [255, 0, 0]

		cv2.imshow('thresh',thresh)
		cv2.imshow('canny', canny)
		cv2.imshow('dst', img)

		if cv2.waitKey(25) & 0xFF == ord("q"):
			cv2.destroyAllWindows()
			break
